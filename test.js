// node test.js — เทียบกับค่าอ้างอิงที่คำนวณจาก Python ต้นฉบับ (ดู ref ด้านล่าง)
const { calculateShadow } = require("./calc.js");
const ref = require("./ref.json");
let bad = 0;
for (const c of ref) {
  const r = calculateShadow(...c.in);
  for (const k of ["n", "st", "delta", "omega", "alpha", "psiSun", "psiShadow", "d", "xc", "yc", "theta"]) {
    if (Math.abs(r[k] - c.out[k]) > 1e-9) { bad++; console.log("MISMATCH", c.in, k, r[k], c.out[k]); }
  }
  if (r.sunUp !== c.out.sunUp || r.dirName !== c.out.dirName) { bad++; console.log("MISMATCH flag/dir", c.in, r.dirName, c.out.dirName); }
}
// เขตเวลาอื่น: โตเกียว (UTC+9 → 135°E) เที่ยงนาฬิกาต้องใกล้เที่ยงสุริยะ (|E| < 17 นาที)
const tk = calculateShadow(35.68, 135, 2026, 5, 1, 12, 2, 5, 135);
if (Math.abs(tk.st - 12) > 0.3) { bad++; console.log("FAIL tz", tk.st); }

console.log(bad ? `FAIL ${bad}` : `OK ${ref.length} cases`);
process.exit(bad ? 1 : 0);
