import Markdown from 'markdown-it';
import hljs from 'highlight.js';
import TurndownService from 'turndown';
import html_to_pdf from 'html-pdf-node';
import * as fs from "fs";

//Convert markdown into html
export default async function markdownTranslate(mdText) {
  const md = Markdown({
    highlight: (
      str,
      lang
    ) => {
      const code = lang && hljs.getLanguage(lang)
        ? hljs.highlight(str, {
          language: lang,
          ignoreIllegals: true,
        }).value
        : md.utils.escapeHtml(str);
      return `<pre class="hljs"><code>${code}</code></pre>`;
    },
  });

  if (!mdText) {
    return null;
  }

  try {
    return await md.render(mdText);
  } catch (e) {
    console.error(e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}

//convert html into markdown
export async function htmlToMarkdown(htmlString) {
  const turndownService = new TurndownService()
  try {
    return await turndownService.turndown(htmlString);
  } catch (e) {
    console.error(e);
    return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
  }
}

//markdown to pdf
export async function markdownToPdf(mdText, outputPath, translationOptions = {output: "file"}) {
  //convert md to html
  const html = await markdownTranslate(mdText);

  //convert html to pdf
  const pdfOptions = { format: 'A4' };
  const file = { content: html };

  if (translationOptions.output === "raw") {
    let htmlToPdf = "";
    try {
      htmlToPdf = await html_to_pdf.generatePdf(file, pdfOptions);
    } catch (e) {
      console.error(e);
      return "ERROR IN TEXT TRANSLATION ! Please contact the administrator.";
    }

    return htmlToPdf;
  }

  await html_to_pdf.generatePdf(file, pdfOptions).then(pdfBuffer => {
    fs.writeFileSync(outputPath, pdfBuffer);
  });
}

//TODO: add the ability to write articles in markdown and display to webpage