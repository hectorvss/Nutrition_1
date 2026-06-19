const sharp = require('sharp');
const path = require('path');

const src = 'C:\\Users\\usuario\\OneDrive - Universidad Politécnica de Cartagena\\Documentos\\Claude\\Nutrition\\Pictures\\Logo_con_fondo.png';
const dest = path.resolve(__dirname, '../public/favicon.png');

(async () => {
  const trimmed = await sharp(src)
    .trim({ background: { r: 200, g: 240, b: 0 }, threshold: 40 })
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  const pad = Math.round(meta.width * 0.10);
  console.log(`Trimmed: ${meta.width}x${meta.height}  pad: ${pad}`);

  const info = await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad,
              background: { r: 200, g: 245, b: 0, alpha: 1 } })
    .resize(512, 512)
    .png()
    .toFile(dest);

  console.log(`favicon.png written: ${info.width}x${info.height}`);
})();
