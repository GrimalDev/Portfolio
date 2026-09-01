import Markdown from "markdown-it";
import hljs from "highlight.js";
import TurndownService from "turndown";
import html_to_pdf from "html-pdf-node";
import { writePdfCache } from "./pdf-cache.js";
import { runExclusive } from "./pdf-queue.js";

const PDF_GENERATION_TIMEOUT_MS =
  Number(process.env.PDF_GENERATION_TIMEOUT_MS) || 30_000;
const PDF_BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

function pdfGenerationError(message, code, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Rejects with a PDF_GENERATION_TIMEOUT once the budget is spent, without
// leaving the timer armed when the promise settles first.
function withGenerationTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(
        pdfGenerationError(
          `PDF generation exceeded ${PDF_GENERATION_TIMEOUT_MS} ms`,
          "PDF_GENERATION_TIMEOUT",
        ),
      );
    }, PDF_GENERATION_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function generatePdfWithContainment(file, options) {
  const caller = createDeferred();

  const slot = runExclusive(async () => {
    const generation = html_to_pdf.generatePdf(file, options);

    // The generation budget starts here, not when the caller joined the queue,
    // so waiting in the FIFO never eats into the render's own time.
    withGenerationTimeout(generation).then(caller.resolve, caller.reject);

    // Keep holding the slot until Chromium really exits. A caller that gave up
    // on the timeout must not let the next render start a second browser.
    await generation.catch(() => {});
  });

  // Queue-level failures (full queue, wait ceiling) never reach the task, so
  // surface them to the caller here. Settling twice is a no-op.
  slot.catch(caller.reject);

  return caller.promise;
}

// Function to clean markdown of Handlebars placeholders and potential injections
function cleanMarkdown(mdText) {
  if (!mdText) return mdText;

  // Remove Handlebars placeholders ({{...}})
  let cleanedText = mdText.replace(/{{.*?}}/g, "");

  // Additional sanitization (optional, for other injection risks)
  // Remove potential script tags or other dangerous content
  cleanedText = cleanedText.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  cleanedText = cleanedText.replace(/<[^>]+on\w*=["'][^"']*["']/gi, ""); // Remove event handlers (e.g., onclick)

  return cleanedText;
}

// Convert markdown to HTML
export default async function markdownTranslate(mdText) {
  const md = Markdown({
    highlight: (str, lang) => {
      const code =
        lang && hljs.getLanguage(lang)
          ? hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          : md.utils.escapeHtml(str);
      return `<pre class="hljs"><code>${code}</code></pre>`;
    },
  });

  if (!mdText) {
    return null;
  }

  try {
    // Clean markdown before rendering
    const cleanedMdText = cleanMarkdown(mdText);
    return await md.render(cleanedMdText);
  } catch (e) {
    console.error("Markdown rendering error:", e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}

// Convert HTML to markdown
export async function htmlToMarkdown(htmlString) {
  const turndownService = new TurndownService();
  try {
    return await turndownService.turndown(htmlString);
  } catch (e) {
    console.error("HTML to markdown error:", e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}

// Markdown to PDF.
// Always writes the generated PDF to `outputPath` so the next request for the
// same document is served from disk instead of spawning Chromium again.
// Throws on failure - callers are responsible for turning that into a response.
export async function markdownToPdf(
  mdText,
  outputPath,
  translationOptions = { output: "file" },
) {
  const cleanedMdText = cleanMarkdown(mdText);
  const html = await markdownTranslate(cleanedMdText);

  const pdfOptions = { format: "A4", args: PDF_BROWSER_ARGS };
  const file = { content: html };

  const pdfBuffer = await generatePdfWithContainment(file, pdfOptions);

  if (outputPath) {
    writePdfCache(outputPath, pdfBuffer);
  }

  return translationOptions.output === "raw" ? pdfBuffer : undefined;
}
