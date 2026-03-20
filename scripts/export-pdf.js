import { createServer } from 'node:http';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const DIST_DIR = join(process.cwd(), 'dist');
const PUBLIC_DIR = join(process.cwd(), 'public');
const HOST = '127.0.0.1';
const PORT = 4173;
const BOOK_PATH = '/book/';
const DIST_OUTPUT_PATH = join(DIST_DIR, 'recipe-collection.pdf');
const PUBLIC_OUTPUT_PATH = join(PUBLIC_DIR, 'recipe-collection.pdf');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function resolveFilePath(urlPath) {
  const safePath = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST_DIR, safePath);
  if (safePath.endsWith('/')) filePath = join(DIST_DIR, safePath, 'index.html');
  if (!extname(filePath)) filePath = `${filePath}.html`;
  return filePath;
}

async function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
      const pathname = url.pathname === '/' ? BOOK_PATH : url.pathname;
      const filePath = resolveFilePath(pathname);
      const data = await readFile(filePath);
      const contentType = mimeTypes[extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, () => resolve());
  });

  return server;
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.goto(`http://${HOST}:${PORT}${BOOK_PATH}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const images = Array.from(document.images || []);
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        })
      );
    });
    await page.emulateMedia({ media: 'screen' });
    await page.addStyleTag({
      content: 'body { padding: 0 !important; } .page { box-shadow: none !important; } .print-btn { display: none !important; }',
    });
    await mkdir(PUBLIC_DIR, { recursive: true });
    await page.pdf({
      path: PUBLIC_OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });
    await copyFile(PUBLIC_OUTPUT_PATH, DIST_OUTPUT_PATH);
    console.log(`PDF written to ${PUBLIC_OUTPUT_PATH}`);
    console.log(`PDF copied to ${DIST_OUTPUT_PATH}`);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
