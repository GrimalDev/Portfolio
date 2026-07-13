import Markdown from "markdown-it";
import hljs from "highlight.js";
import TurndownService from "turndown";
import html_to_pdf from "html-pdf-node";
import * as fs from "fs";

const PDF_GENERATION_TIMEOUT_MS = 10_000;
const PDF_BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];
let activePdfGeneration = null;

function pdfGenerationError(message, code, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

async function generatePdfWithContainment(file, options) {
  if (activePdfGeneration) {
    throw pdfGenerationError(
      "PDF generation is already in progress",
      "PDF_GENERATION_BUSY",
    );
  }

  const generation = html_to_pdf.generatePdf(file, options);
  activePdfGeneration = generation;
  generation
    .finally(() => {
      activePdfGeneration = null;
    })
    .catch(() => {});

  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        pdfGenerationError(
          `PDF generation exceeded ${PDF_GENERATION_TIMEOUT_MS} ms`,
          "PDF_GENERATION_TIMEOUT",
        ),
      );
    }, PDF_GENERATION_TIMEOUT_MS);
  });

  return Promise.race([generation, timeout]);
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

// Markdown to PDF
export async function markdownToPdf(
  mdText,
  outputPath,
  translationOptions = { output: "file" },
) {
  // Clean markdown before processing
  const cleanedMdText = cleanMarkdown(mdText);

  // Convert markdown to HTML
  const html = await markdownTranslate(cleanedMdText);

  // Convert HTML to PDF
  const pdfOptions = { format: "A4", args: PDF_BROWSER_ARGS };
  const file = { content: html };

  if (translationOptions.output === "raw") {
    return generatePdfWithContainment(file, pdfOptions);
  }

  try {
    const pdfBuffer = await generatePdfWithContainment(file, pdfOptions);
    fs.writeFileSync(outputPath, pdfBuffer);
  } catch (e) {
    console.error("PDF generation error:", e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}
