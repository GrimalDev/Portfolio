import * as fs from "fs";
import * as path from "path";

const PDF_CACHE_DIR = "public/articles_media/pdf";

export function pdfCachePath(slug) {
  return path.join(PDF_CACHE_DIR, `${slug}-doc.pdf`);
}

// The cache directory lives under a gitignored path, so it is absent from a
// freshly built container. Every writer must make sure it exists first.
export function ensurePdfCacheDir() {
  fs.mkdirSync(PDF_CACHE_DIR, { recursive: true });
}

// Returns the cached PDF buffer, or null when there is no usable cache entry.
// A read failure is never fatal: the caller regenerates instead.
export function readPdfCache(slug) {
  const cachePath = pdfCachePath(slug);
  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    return fs.readFileSync(cachePath);
  } catch (e) {
    console.error("PDF cache read error:", e);
    return null;
  }
}

// Writes through a temp file then renames, so a concurrent reader never sees
// a partially written PDF. A write failure is logged and swallowed: the client
// still gets the buffer we just generated.
export function writePdfCache(cachePath, pdfBuffer) {
  const tempPath = `${cachePath}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(tempPath, pdfBuffer);
    fs.renameSync(tempPath, cachePath);
  } catch (e) {
    console.error("PDF cache write error:", e);
    try {
      fs.rmSync(tempPath, { force: true });
    } catch {
      // temp file cleanup is best effort
    }
  }
}

export function invalidatePdfCache(slug) {
  try {
    fs.rmSync(pdfCachePath(slug), { force: true });
  } catch (e) {
    console.error("PDF cache invalidation error:", e);
  }
}
