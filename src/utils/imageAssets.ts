import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

function getOptimizedCandidate(src: string) {
  const ext = extname(src);
  return src.replace(new RegExp(`${ext}$`), '.optimized.webp');
}

function getPdfCandidate(src: string) {
  const ext = extname(src);
  return src.replace(new RegExp(`${ext}$`), '.pdf.jpg');
}

function hasPublicAsset(src: string) {
  const assetPath = join(process.cwd(), 'public', src.replace(/^\//, ''));
  return existsSync(assetPath);
}

export function getRecipeImageSrc(src: string, variant: 'default' | 'pdf' = 'default') {
  if (!src.startsWith('/') || src.startsWith('//')) return src;

  if (variant === 'pdf') {
    const pdfSrc = getPdfCandidate(src);
    if (hasPublicAsset(pdfSrc)) return pdfSrc;
  }

  const optimizedSrc = getOptimizedCandidate(src);
  return hasPublicAsset(optimizedSrc) ? optimizedSrc : src;
}
