const dns = require('dns').promises;
const AppError = require('./appError');

// Chan SSRF: dung truoc khi server tu fetch 1 URL do user nhap (vd iCal sync
// link tu host) - neu khong chan, ai cung dat 1 host lam listing roi dan URL
// tro vao mang noi bo (127.0.0.1, 169.254.169.254 - metadata cua AWS/GCP/
// Azure, 10.x/172.16.x/192.168.x...) de do server tu ket noi thay minh.
function isPrivateIPv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIPv6(address) {
  const a = address.toLowerCase();
  if (a === '::1') return true;
  if (a.startsWith('fe80:') || a.startsWith('fe8') || a.startsWith('fe9') || a.startsWith('fea') || a.startsWith('feb')) return true;
  if (a.startsWith('fc') || a.startsWith('fd')) return true;
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

async function assertPublicHttpUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError(422, 'Invalid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new AppError(422, 'URL must use http or https');
  }
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new AppError(422, 'This URL is not allowed');
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new AppError(422, 'Could not resolve this URL');
  }
  if (addresses.length === 0) {
    throw new AppError(422, 'Could not resolve this URL');
  }
  for (const { address, family } of addresses) {
    const blocked = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address);
    if (blocked) {
      throw new AppError(422, 'This URL points to a restricted network and cannot be used');
    }
  }
}

module.exports = { assertPublicHttpUrl };
