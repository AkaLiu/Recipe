import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import process from 'node:process';

const DIST_DIR = join(process.cwd(), 'dist');
const PUBLIC_DIR = join(process.cwd(), 'public');
const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_PATH = '/Recipe';
const BOOK_PATH = `${BASE_PATH}/book/`;
const DIST_OUTPUT_PATH = join(DIST_DIR, 'recipe-collection.pdf');
const PUBLIC_OUTPUT_PATH = join(PUBLIC_DIR, 'recipe-collection.pdf');
const PAGED_STYLE_PATH = join(process.cwd(), '.pagedjs-export.css');
const COMPRESSED_OUTPUT_PATH = join(PUBLIC_DIR, 'recipe-collection.compressed.pdf');

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
  '.pdf': 'application/pdf',
};

function resolveFilePath(urlPath) {
  const strippedPath = urlPath.startsWith(BASE_PATH) ? urlPath.slice(BASE_PATH.length) || '/' : urlPath;
  const safePath = normalize(decodeURIComponent(strippedPath)).replace(/^(\.\.[/\\])+/, '');
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

async function runPagedCli() {
  await writeFile(
    PAGED_STYLE_PATH,
    'body { padding: 0 !important; } .page { box-shadow: none !important; } .print-btn { display: none !important; }',
    'utf8'
  );

  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'pagedjs-cli',
        `http://${HOST}:${PORT}${BOOK_PATH}`,
        '--output',
        PUBLIC_OUTPUT_PATH,
        '--media',
        'screen',
        '--timeout',
        '120000',
        '--style',
        PAGED_STYLE_PATH,
        '--browserArgs',
        '--no-sandbox',
      ],
      {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: process.env,
      }
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pagedjs-cli exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function compressPdfWithGhostscript() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      '/usr/local/bin/gs',
      [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.6',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${COMPRESSED_OUTPUT_PATH}`,
        PUBLIC_OUTPUT_PATH,
      ],
      {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: process.env,
      }
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ghostscript exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  const server = await startServer();

  try {
    await runPagedCli();
    await compressPdfWithGhostscript();

    const [originalStat, compressedStat] = await Promise.all([
      stat(PUBLIC_OUTPUT_PATH),
      stat(COMPRESSED_OUTPUT_PATH),
    ]);

    if (compressedStat.size < originalStat.size) {
      await rename(COMPRESSED_OUTPUT_PATH, PUBLIC_OUTPUT_PATH);
      console.log(
        `PDF compressed: ${(originalStat.size / 1024 / 1024).toFixed(1)}MB -> ${(compressedStat.size / 1024 / 1024).toFixed(1)}MB`
      );
    } else {
      await rm(COMPRESSED_OUTPUT_PATH, { force: true });
    }

    await copyFile(PUBLIC_OUTPUT_PATH, DIST_OUTPUT_PATH);
    console.log(`PDF written to ${PUBLIC_OUTPUT_PATH}`);
    console.log(`PDF copied to ${DIST_OUTPUT_PATH}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
