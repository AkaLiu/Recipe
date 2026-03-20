#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'recipes');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ONE_MB = 1024 * 1024;

function isLocalPublicPath(value) {
  return value.startsWith('/') && !value.startsWith('//');
}

function getOptimizedPublicPath(publicPath) {
  const ext = path.extname(publicPath);
  return publicPath.replace(new RegExp(`${ext}$`), '.optimized.webp');
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

async function optimizeImage(publicPath) {
  const sourcePath = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ''));
  const optimizedPublicPath = getOptimizedPublicPath(publicPath);
  const optimizedPath = path.join(PUBLIC_DIR, optimizedPublicPath.replace(/^\//, ''));

  try {
    const stat = await fs.stat(sourcePath);

    if (stat.size <= ONE_MB) {
      await fs.rm(optimizedPath, { force: true });
      return { publicPath, status: 'skip-small' };
    }

    const sourceMeta = await sharp(sourcePath).metadata();

    await fs.mkdir(path.dirname(optimizedPath), { recursive: true });

    const transformer = sharp(sourcePath).rotate().withMetadata();
    const ext = path.extname(sourcePath).toLowerCase();

    if (ext === '.png') {
      await transformer
        .webp({
          lossless: true,
          nearLossless: true,
          quality: 92,
          effort: 6,
        })
        .toFile(optimizedPath);
    } else {
      await transformer
        .webp({
          quality: 86,
          effort: 6,
          smartSubsample: true,
        })
        .toFile(optimizedPath);
    }

    const optimizedStat = await fs.stat(optimizedPath);
    const optimizedMeta = await sharp(optimizedPath).metadata();

    const sameDimensions =
      sourceMeta.width === optimizedMeta.width &&
      sourceMeta.height === optimizedMeta.height;

    if (!sameDimensions || optimizedStat.size >= stat.size) {
      await fs.rm(optimizedPath, { force: true });
      return { publicPath, status: 'keep-original' };
    }

    return {
      publicPath,
      status: 'optimized',
      beforeKB: (stat.size / 1024).toFixed(1),
      afterKB: (optimizedStat.size / 1024).toFixed(1),
    };
  } catch (error) {
    return { publicPath, status: 'error', error: error.message };
  }
}

async function main() {
  const images = await extractCoverImages();

  if (!images.length) {
    console.log('No local recipe cover images found.');
    return;
  }

  const results = [];
  for (const image of images) {
    results.push(await optimizeImage(image));
  }

  for (const result of results) {
    if (result.status === 'optimized') {
      console.log(`✓ Optimized ${result.publicPath}: ${result.beforeKB}KB -> ${result.afterKB}KB`);
    } else if (result.status === 'skip-small') {
      console.log(`- Skipped ${result.publicPath}: <= 1MB`);
    } else if (result.status === 'keep-original') {
      console.log(`- Kept original ${result.publicPath}: optimized file was not smaller or changed dimensions`);
    } else {
      console.log(`✗ Failed ${result.publicPath}: ${result.error}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
