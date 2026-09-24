// Resize raw product photos into two web sizes. Usage: node scripts/build-images.mjs <rawImagesDir>
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const src = process.argv[2];
const files = fs.readdirSync(src).filter((f) => f.endsWith(".jpg"));
for (const f of files) {
  const id = path.basename(f, ".jpg");
  const img = sharp(path.join(src, f)).flatten({ background: "#ffffff" });
  await img.clone().resize(220, 220, { fit: "contain", background: "#ffffff" }).webp({ quality: 62 }).toFile(`public/catalog/s/${id}.webp`);
  await img.clone().resize(760, 760, { fit: "contain", background: "#ffffff" }).webp({ quality: 74 }).toFile(`public/catalog/m/${id}.webp`);
}
console.log("done", files.length);
