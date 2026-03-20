#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'recipes');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ONE_MB = 1024 * 1024;
const MAX_LONG_EDGE = 2200;

function isLocalPublicPath(value) {
  return value.startsWith('/') && !value.startsWith('//');
}

function getPdfPublicPath(publicPath) {
  const ext = path.extname(publicPath);
  return publicPath.replace(new RegExp(`${ext}$`), '.pdf.jpg');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function extractCoverImages() {
  const files = await walk(CONTENT_DIR);
  const imageSet = new Set();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const match = content.match(/coverImage:\s*["']([^"']+)["']/);
    if (!match) continue;
    const value = match[1].trim();
    if (isLocalPublicPath(value)) imageSet.add(value);
  }

  return [...imageSet];
}

async function optimizePdfImage(publicPath) {
  const sourcePath = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ''));
  const pdfPublicPath = getPdfPublicPath(publicPath);
  const pdfPath = path.join(PUBLIC_DIR, pdfPublicPath.replace(/^\//, ''));

  try {
    const stat = await fs.stat(sourcePath);
    const source = sharp(sourcePath).rotate();
    const meta = await source.metadata();

    if (!meta.width || !meta.height) {
      return { publicPath, status: 'skip-invalid' };
    }

    const longEdge = Math.max(meta.width, meta.height);
    const resizeNeeded = longEdge > MAX_LONG_EDGE;
    const oversized = stat.size > ONE_MB;

    if (!resizeNeeded && !oversized) {
      await fs.rm(pdfPath, { force: true });
      return { publicPath, status: 'skip-small' };
    }

    const width = meta.width >= meta.height ? Math.min(meta.width, MAX_LONG_EDGE) : null;
    const height = meta.height > meta.width ? Math.min(meta.height, MAX_LONG_EDGE) : null;

    await fs.mkdir(path.dirname(pdfPath), { recursive: true });

    await source
      .resize({
        width: width || undefined,
        height: height || undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .withMetadata()
      .jpeg({
        quality: 84,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: '4:4:4',
      })
      .toFile(pdfPath);

    const pdfStat = await fs.stat(pdfPath);
    const pdfMeta = await sharp(pdfPath).metadata();

    if (!pdfMeta.width || !pdfMeta.height || pdfStat.size >= stat.size) {
      await fs.rm(pdfPath, { force: true });
      return { publicPath, status: 'keep-original' };
    }

    return {
      publicPath,
      status: 'optimized',
      beforeKB: (stat.size / 1024).toFixed(1),
      afterKB: (pdfStat.size / 1024).toFixed(1),
      width: `${meta.width}→${pdfMeta.width}`,
      height: `${meta.height}→${pdfMeta.height}`,
    };
  } catch (error) {
    return { publicPath, status: 'error', error: error.message };
  }
}

async function main() {
  const images = await extractCoverImages();

  if (!images.length) {
    console.log('No local recipe cover images found for PDF optimization.');
    return;
  }

  const results = [];
  for (const image of images) {
    results.push(await optimizePdfImage(image));
  }

  for (const result of results) {
    if (result.status === 'optimized') {
      console.log(
        `✓ PDF image ${result.publicPath}: ${result.beforeKB}KB -> ${result.afterKB}KB (${result.width}, ${result.height})`
      );
    } else if (result.status === 'skip-small') {
      console.log(`- Skipped ${result.publicPath}: already small enough for PDF`);
    } else if (result.status === 'skip-invalid') {
      console.log(`- Skipped ${result.publicPath}: invalid image metadata`);
    } else if (result.status === 'keep-original') {
      console.log(`- Kept original ${result.publicPath}: PDF variant was not smaller`);
    } else {
      console.log(`✗ Failed ${result.publicPath}: ${result.error}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
