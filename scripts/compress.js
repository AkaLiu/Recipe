const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const quality = parseInt(process.argv[2]) || 80;
const maxWidth = parseInt(process.argv[3]) || 1920;

async function compressImages(inputDir, outputDir) {
  try {
    const files = await fs.readdir(inputDir);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const stat = await fs.stat(inputPath);

      if (stat.isDirectory()) {
        await compressImages(inputPath, path.join(outputDir, file));
        continue;
      }

      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

      const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg)$/i, '.webp'));

      console.log(`Compressing ${file}...`);

      try {
        await sharp(inputPath)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .webp({ quality })
          .toFile(outputPath);

        const newSize = (await fs.stat(outputPath)).size;
        console.log(`✓ Saved: ${file} -> ${(newSize / 1024).toFixed(1)}KB`);
      } catch (err) {
        console.error(`✗ Error processing ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

compressImages('./public/images/recipes', './public/images/recipes');
