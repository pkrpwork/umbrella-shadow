// สูตรคำนวณเงาร่ม (พอร์ตจากแนวคิดเดิม) — ทิศ: 0=เหนือ, 90=ออก, 180=ใต้, 270=ตก
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

const DIRS = ["ทิศเหนือ", "ทิศตะวันออกเฉียงเหนือ", "ทิศตะวันออก", "ทิศตะวันออกเฉียงใต้",
  "ทิศใต้", "ทิศตะวันตกเฉียงใต้", "ทิศตะวันตก", "ทิศตะวันตกเฉียงเหนือ"];

function directionTh(d) {
  return DIRS[Math.floor((((d % 360) + 360) % 360 + 22.5) / 45) % 8];
}

// ลำดับวันในปี (ใช้ UTC กันปัญหา DST)
function dayOfYear(y, m, d) {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 1;
}

function solarTime(clockHours, lon, n, stdLon = 105) {
  const b = rad((360 * (n - 81)) / 364);
  const e = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  return { st: clockHours + (4 * (lon - stdLon) + e) / 60, e };
}

function calculateShadow(lat, lon, y, m, d, clockHours, R, h, stdLon = 105) {
  const n = dayOfYear(y, m, d);
  const aUmbrella = Math.PI * R * R;
  const { st, e } = solarTime(clockHours, lon, n, stdLon);
  const delta = rad(23.45 * Math.sin(rad((360 / 365) * (284 + n))));
  const omegaDeg = 15 * (st - 12);
  const phi = rad(lat);

  const sinA = Math.max(-1, Math.min(1,
    Math.sin(delta) * Math.sin(phi) + Math.cos(delta) * Math.cos(phi) * Math.cos(rad(omegaDeg))));
  const alpha = Math.asin(sinA);
  const base = { n, st, e, delta: deg(delta), omega: omegaDeg, alpha: deg(alpha), aUmbrella };

  if (base.alpha <= 0) {
    return { ...base, psiSun: 0, psiShadow: 0, d: 0, xc: 0, yc: 0, aShadow: 0, theta: 90, sunUp: false, dirName: "-" };
  }

  const cosAz = Math.max(-1, Math.min(1,
    (Math.sin(delta) - Math.sin(phi) * sinA) / (Math.cos(phi) * Math.cos(alpha))));
  let az = deg(Math.acos(cosAz));
  if (omegaDeg > 0) az = 360 - az; // บ่าย: ดวงอาทิตย์อยู่ทางตะวันตก

  const dist = h / Math.tan(alpha);
  const psiShadow = (az >= 180 ? az - 180 : az + 180) % 360;
  return {
    ...base, psiSun: az, psiShadow, d: dist,
    xc: -dist * Math.sin(rad(az)), yc: -dist * Math.cos(rad(az)),
    aShadow: aUmbrella, theta: 90 - base.alpha, sunUp: true, dirName: directionTh(psiShadow),
  };
}

if (typeof module !== "undefined") module.exports = { calculateShadow, dayOfYear };
