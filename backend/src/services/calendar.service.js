const ical = require('node-ical');
const { CalendarDayStatus, CalendarDaySource } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { getBasePrice } = require('../utils/pricing.util');

function pad(n) {
  return String(n).padStart(2, '0');
}

// Dung cho Date da UTC-anchored: doc tu DB (Prisma chuan hoa cot @db.Date ve
// UTC midnight), hoac tu chuoi 'YYYY-MM-DD' tu minh tao (new Date('YYYY-MM-DD')
// luon parse la UTC theo spec ISO 8601, khong phu thuoc timezone server).
function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

// Dung RIENG cho Date tra ve tu node-ical (truong VALUE=DATE). Thu vien dung
// Date constructor kieu local (nam, thang, ngay) chu khong phai UTC, nen doc
// lai phai dung getter local (getFullYear/getMonth/getDate) - goi toISOString()
// truc tiep se bi lech 1 ngay tuy server chay timezone gi (da test that voi
// file .ics mau: server chay UTC+7 thi bi lui lai 1 ngay neu dung toISOString).
function icalDateToYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysInMonth(year, month) {
  // month la 1-indexed; Date(year, month, 0) = ngay cuoi cung cua thang do.
  return new Date(year, month, 0).getDate();
}

async function assertOwnedByHost(listingId, hostId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }
  if (listing.hostId !== hostId) {
    throw new AppError(403, 'You do not own this listing');
  }
  return listing;
}

// REQ_12: lich 1 thang cho 1 listing - gia + trang thai tung ngay.
async function getMonthView({ listingId, hostId, year, month }) {
  const listing = await assertOwnedByHost(listingId, hostId);

  const monthStart = new Date(`${year}-${pad(month)}-01`);
  const total = daysInMonth(year, month);
  const monthEnd = new Date(`${year}-${pad(month)}-${pad(total)}`);

  const [calendarRows, overrideRows, stayRuleRows] = await Promise.all([
    prisma.listingCalendar.findMany({
      where: { listingId, date: { gte: monthStart, lte: monthEnd } },
      include: { booking: { include: { guest: true } }, calendarSync: true },
    }),
    prisma.listingPriceOverride.findMany({
      where: { listingId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.listingStayRule.findMany({
      where: { listingId, date: { gte: monthStart, lte: monthEnd } },
    }),
  ]);

  const calendarByDate = new Map(calendarRows.map((r) => [toYMD(r.date), r]));
  const overrideByDate = new Map(overrideRows.map((r) => [toYMD(r.date), Number(r.price)]));
  const stayRuleByDate = new Map(stayRuleRows.map((r) => [toYMD(r.date), r]));

  const days = [];
  for (let d = 1; d <= total; d++) {
    const ymd = `${year}-${pad(month)}-${pad(d)}`;
    const row = calendarByDate.get(ymd);
    const hasOverride = overrideByDate.has(ymd);
    const stayRule = stayRuleByDate.get(ymd);
    const basePrice = getBasePrice(listing, ymd);

    let guestLabel = null;
    let booking = null;
    if (row?.source === CalendarDaySource.booking && row.booking) {
      guestLabel = row.booking.guest?.fullName || null;
      booking = {
        id: row.booking.id,
        checkIn: toYMD(row.booking.checkIn),
        checkOut: toYMD(row.booking.checkOut),
        adultsCount: row.booking.adultsCount,
        childrenCount: row.booking.childrenCount,
        totalPrice: Number(row.booking.totalPrice),
        contactName: row.booking.contactName,
        contactEmail: row.booking.contactEmail,
        contactPhone: row.booking.contactPhone,
      };
    } else if (row?.source === CalendarDaySource.ical_sync) {
      guestLabel = row.calendarSync ? `Booked via ${row.calendarSync.label}` : 'Booked (external sync)';
    }

    days.push({
      date: ymd,
      day: d,
      price: hasOverride ? overrideByDate.get(ymd) : basePrice,
      basePrice,
      hasOverride,
      status: row ? row.status : 'available',
      source: row?.source || null,
      note: row?.note || null,
      guestLabel,
      booking,
      minNights: stayRule?.minNights ?? null,
      maxNights: stayRule?.maxNights ?? null,
    });
  }

  return {
    listingId,
    weekdayPrice: Number(listing.weekdayPrice),
    weekendPrice: Number(listing.weekendPrice),
    days,
  };
}

// "Custom settings" - so dem toi thieu/toi da neu khach check-in vao dung
// ngay nay. Xoa dong neu ca 2 gia tri deu rong (khong con rule nao dat ra).
async function setStayRule({ listingId, hostId, date, minNights, maxNights }) {
  await assertOwnedByHost(listingId, hostId);

  if (minNights == null && maxNights == null) {
    await prisma.listingStayRule.deleteMany({ where: { listingId, date: new Date(date) } });
    return null;
  }

  return prisma.listingStayRule.upsert({
    where: { listingId_date: { listingId, date: new Date(date) } },
    update: { minNights, maxNights },
    create: { listingId, date: new Date(date), minNights, maxNights },
  });
}

// REQ_12: host chan tay 1 hoac nhieu ngay. Khong cho chan de len ngay da co
// booking that (source: booking) - chi cho de len ngay trong hoac ngay da
// tung sync tu ngoai (host chu dong ghi de uu tien).
async function blockDates({ listingId, hostId, dates, note }) {
  await assertOwnedByHost(listingId, hostId);

  return prisma.$transaction(async (tx) => {
    const targets = dates.map((d) => new Date(d));
    const existing = await tx.listingCalendar.findMany({
      where: { listingId, date: { in: targets } },
    });
    const bookedConflict = existing.find((r) => r.source === CalendarDaySource.booking);
    if (bookedConflict) {
      throw new AppError(409, `${toYMD(bookedConflict.date)} already has a guest booking, it cannot be blocked`);
    }

    await Promise.all(
      dates.map((d) =>
        tx.listingCalendar.upsert({
          where: { listingId_date: { listingId, date: new Date(d) } },
          update: {
            status: CalendarDayStatus.blocked,
            source: CalendarDaySource.manual,
            note: note || null,
            bookingId: null,
            calendarSyncId: null,
          },
          create: {
            listingId,
            date: new Date(d),
            status: CalendarDayStatus.blocked,
            source: CalendarDaySource.manual,
            note: note || null,
          },
        }),
      ),
    );
  });
}

// REQ_12: host mo lai (bo chan) ngay da tu chan - chi xoa dong nguon "manual",
// khong dung cham vao ngay dang co booking that hoac dang sync tu ngoai.
async function unblockDates({ listingId, hostId, dates }) {
  await assertOwnedByHost(listingId, hostId);

  await prisma.listingCalendar.deleteMany({
    where: {
      listingId,
      date: { in: dates.map((d) => new Date(d)) },
      source: CalendarDaySource.manual,
    },
  });
}

// REQ_13-ish (gia rieng theo ngay), dung chung trong man hinh lich REQ_12.
async function setPriceOverride({ listingId, hostId, date, price }) {
  await assertOwnedByHost(listingId, hostId);

  return prisma.listingPriceOverride.upsert({
    where: { listingId_date: { listingId, date: new Date(date) } },
    update: { price },
    create: { listingId, date: new Date(date), price },
  });
}

async function listSyncSources({ listingId, hostId }) {
  await assertOwnedByHost(listingId, hostId);
  return prisma.listingCalendarSync.findMany({ where: { listingId }, orderBy: { createdAt: 'asc' } });
}

// Ket noi 1 lich ngoai (Airbnb/VRBO...) qua link iCal, roi dong bo lan dau ngay.
async function connectIcalSource({ listingId, hostId, icalUrl, label }) {
  await assertOwnedByHost(listingId, hostId);

  const sync = await prisma.listingCalendarSync.create({ data: { listingId, icalUrl, label } });
  await syncIcalSource({ listingId, hostId, syncId: sync.id });
  return prisma.listingCalendarSync.findUnique({ where: { id: sync.id } });
}

// Tai lai + parse file .ics tu 1 nguon da ket noi, ghi de toan bo ngay bi
// chan boi CHINH nguon nay (calendarSyncId = syncId) - don gian hon diff
// theo UID tung su kien, va tranh phai them cot moi de luu UID.
// Bo qua ngay nao da co du lieu tu nguon khac (manual/booking) de tranh
// dung constraint unique(listingId, date).
async function syncIcalSource({ listingId, hostId, syncId }) {
  await assertOwnedByHost(listingId, hostId);

  const sync = await prisma.listingCalendarSync.findUnique({ where: { id: syncId } });
  if (!sync || sync.listingId !== listingId) {
    throw new AppError(404, 'Calendar sync source not found');
  }

  let parsed;
  try {
    parsed = await ical.async.fromURL(sync.icalUrl);
  } catch (err) {
    throw new AppError(502, 'Could not load a calendar from this URL');
  }

  const blockedDates = new Set();
  for (const event of Object.values(parsed)) {
    if (event.type !== 'VEVENT' || !event.start || !event.end) continue;

    const cur = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const end = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
    while (cur < end) {
      blockedDates.add(icalDateToYMD(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.listingCalendar.deleteMany({ where: { listingId, calendarSyncId: syncId } });

    if (blockedDates.size > 0) {
      const candidateDates = [...blockedDates].map((d) => new Date(d));
      const existing = await tx.listingCalendar.findMany({
        where: { listingId, date: { in: candidateDates } },
      });
      const taken = new Set(existing.map((r) => toYMD(r.date)));

      const toCreate = [...blockedDates]
        .filter((d) => !taken.has(d))
        .map((d) => ({
          listingId,
          date: new Date(d),
          status: CalendarDayStatus.blocked,
          source: CalendarDaySource.ical_sync,
          calendarSyncId: syncId,
          note: `Synced from ${sync.label}`,
        }));

      if (toCreate.length > 0) {
        await tx.listingCalendar.createMany({ data: toCreate });
      }
    }

    return tx.listingCalendarSync.update({ where: { id: syncId }, data: { lastSyncedAt: new Date() } });
  });
}

// Sua ten hien thi va/hoac link .ics cua 1 nguon da ket noi (nut "Edit" trong
// ticket cua Jason). Neu link thay doi thi dong bo lai luon theo link moi.
async function updateSyncSource({ listingId, hostId, syncId, icalUrl, label }) {
  await assertOwnedByHost(listingId, hostId);

  const existing = await prisma.listingCalendarSync.findUnique({ where: { id: syncId } });
  if (!existing || existing.listingId !== listingId) {
    throw new AppError(404, 'Calendar sync source not found');
  }

  await prisma.listingCalendarSync.update({
    where: { id: syncId },
    data: { icalUrl: icalUrl || existing.icalUrl, label: label || existing.label },
  });

  await syncIcalSource({ listingId, hostId, syncId });
  return prisma.listingCalendarSync.findUnique({ where: { id: syncId } });
}

async function removeSyncSource({ listingId, hostId, syncId }) {
  await assertOwnedByHost(listingId, hostId);

  await prisma.$transaction([
    prisma.listingCalendar.deleteMany({ where: { listingId, calendarSyncId: syncId } }),
    prisma.listingCalendarSync.deleteMany({ where: { id: syncId, listingId } }),
  ]);
}

// Gop cac ngay YMD lien tiep nhau thanh tung khoang [start, end) - end la ngay
// SAU ngay cuoi cung cua khoang, khop dung quy uoc DTSTART/DTEND cua iCal.
function groupConsecutiveDates(sortedYmdDates) {
  const ranges = [];
  for (const ymd of sortedYmdDates) {
    const last = ranges[ranges.length - 1];
    if (last && last.end === ymd) {
      last.end = toYMD(new Date(new Date(`${ymd}T00:00:00Z`).getTime() + 86400000));
    } else {
      ranges.push({ start: ymd, end: toYMD(new Date(new Date(`${ymd}T00:00:00Z`).getTime() + 86400000)) });
    }
  }
  return ranges;
}

function buildIcs({ listingId, listingTitle, ranges }) {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID:-//Stayhub//Booking Platform//EN',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${listingTitle}`,
  ];

  ranges.forEach(({ start, end }, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:stayhub-${listingId}-${i}@stayhub.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${start.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${end.replace(/-/g, '')}`,
      'SUMMARY:Reserved',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Xuat lich cua 1 listing ra dinh dang iCal cong khai - de host copy link nay
// dan NGUOC vao Airbnb/VRBO (chieu con lai cua "two-way" trong ticket cua
// Jason, chieu nhap tu ngoai vao da lam o syncIcalSource). Khong yeu cau dang
// nhap (Airbnb khong tu dang nhap duoc) - bao mat bang icalToken rieng cua
// tung listing thay vi JWT, dung dung kieu link ".ics?t=..." nhu Airbnb that.
async function exportIcal({ listingId, token }) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.icalToken !== token) {
    throw new AppError(404, 'Calendar not found');
  }

  const rows = await prisma.listingCalendar.findMany({
    where: { listingId },
    orderBy: { date: 'asc' },
  });

  const ranges = groupConsecutiveDates(rows.map((r) => toYMD(r.date)));
  return buildIcs({ listingId, listingTitle: listing.title, ranges });
}

module.exports = {
  getMonthView,
  blockDates,
  unblockDates,
  setPriceOverride,
  setStayRule,
  listSyncSources,
  connectIcalSource,
  syncIcalSource,
  updateSyncSource,
  removeSyncSource,
  exportIcal,
};
