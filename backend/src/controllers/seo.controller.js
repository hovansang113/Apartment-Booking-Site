const prisma = require('../config/prisma');

// robots.txt/sitemap.xml phuc vu DONG tu backend (khong phai file tinh trong
// frontend/public nua) - dung lai CHINH XAC CLIENT_URL da co san (backend can
// gia tri nay dung cho VNPay return URL roi), nen domain luon dong bo, khong
// phai sua 2 noi moi lan doi domain. sitemap lay thang tu DB nen luon khop
// dung danh sach listing da duyet hien tai, khong bi cu nhu file tinh truoc day.

// SEO_ALLOW_INDEXING: cong tac an toan-mac-dinh - PHAI dat rieng "true" moi
// cho Google index that (yeu cau Jason 18/8: chua muon index luc con dang
// demo/dev). Thieu bien nay (vd quen dat luc deploy) se TU DONG chan index,
// khong vo tinh lo site dev/demo len Google.
function robots(req, res) {
  const siteUrl = process.env.CLIENT_URL || '';
  const allowIndexing = process.env.SEO_ALLOW_INDEXING === 'true';
  const body = allowIndexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  res.type('text/plain').send(body);
}

async function sitemap(req, res) {
  const siteUrl = process.env.CLIENT_URL || '';
  const listings = await prisma.listing.findMany({
    where: { status: 'approved' },
    select: { id: true, updatedAt: true },
  });

  const urls = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    ...listings.map((l) => ({
      loc: `${siteUrl}/listings/${l.id}`,
      lastmod: l.updatedAt.toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n')}\n</urlset>\n`;

  res.type('application/xml').send(body);
}

module.exports = { robots, sitemap };
