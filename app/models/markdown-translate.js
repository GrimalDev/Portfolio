import Markdown from "markdown-it";
import hljs from "highlight.js";
import TurndownService from "turndown";
import html_to_pdf from "html-pdf-node";
import * as fs from "fs";

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
export async function markdownTranslate(mdText) {
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
  const pdfOptions = { format: "A4" };
  const file = { content: html };

  if (translationOptions.output === "raw") {
    try {
      const htmlToPdf = await html_to_pdf.generatePdf(file, pdfOptions);
      return htmlToPdf;
    } catch (e) {
      console.error("PDF generation error:", e);
      return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
    }
  }

  try {
    const pdfBuffer = await html_to_pdf.generatePdf(file, pdfOptions);
    fs.writeFileSync(outputPath, pdfBuffer);
  } catch (e) {
    console.error("PDF generation error:", e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}

