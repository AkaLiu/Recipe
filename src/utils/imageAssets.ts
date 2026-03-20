import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

function getOptimizedCandidate(src: string) {
  const ext = extname(src);
  return src.replace(new RegExp(`${ext}$`), '.optimized.webp');
}

export function getRecipeImageSrc(src: string) {
  if (!src.startsWith('/') || src.startsWith('//')) return src;

  const optimizedSrc = getOptimizedCandidate(src);
  const optimizedPath = join(process.cwd(), 'public', optimizedSrc.replace(/^\//, ''));

  return existsSync(optimizedPath) ? optimizedSrc : src;
}
