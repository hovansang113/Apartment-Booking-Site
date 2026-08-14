// Danh sach ngan hang trong nuoc pho bien, dung chung cho validator (bankCode
// phai la 1 trong cac ma nay) va tra ve cho FE hien dropdown - khong cho host
// go tu do ten ngan hang (de sai chinh ta, khong dong nhat, kho doi soat luc
// chi tra). Ma nay giu ban FE (data/vietnamBanks.js) khop 1-1 - sua o day thi
// phai sua ca ben do.
const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'VIETINBANK', name: 'VietinBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'AGRIBANK', name: 'Agribank' },
  { code: 'TECHCOMBANK', name: 'Techcombank' },
  { code: 'MBBANK', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPBANK', name: 'VPBank' },
  { code: 'SACOMBANK', name: 'Sacombank' },
  { code: 'TPBANK', name: 'TPBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'HDBANK', name: 'HDBank' },
  { code: 'SHB', name: 'SHB' },
  { code: 'SEABANK', name: 'SeABank' },
  { code: 'OCB', name: 'OCB' },
  { code: 'MSB', name: 'MSB' },
  { code: 'EXIMBANK', name: 'Eximbank' },
  { code: 'LPBANK', name: 'LPBank (LienVietPostBank)' },
  { code: 'ABBANK', name: 'ABBank' },
  { code: 'NAMABANK', name: 'Nam A Bank' },
  { code: 'BACABANK', name: 'Bac A Bank' },
  { code: 'PVCOMBANK', name: 'PVcomBank' },
  { code: 'SCB', name: 'SCB' },
  { code: 'VIETBANK', name: 'VietBank' },
  { code: 'DONGABANK', name: 'DongA Bank' },
  { code: 'BAOVIETBANK', name: 'BaoViet Bank' },
  { code: 'KIENLONGBANK', name: 'KienLongBank' },
  { code: 'NCB', name: 'NCB' },
  { code: 'VIETCAPITALBANK', name: 'Viet Capital Bank (Bản Việt)' },
  { code: 'SAIGONBANK', name: 'SaigonBank' },
];

const VIETNAM_BANK_CODES = VIETNAM_BANKS.map((b) => b.code);

module.exports = { VIETNAM_BANKS, VIETNAM_BANK_CODES };
