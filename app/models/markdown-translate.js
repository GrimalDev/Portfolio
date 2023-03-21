import Markdown from 'markdown-it';
import hljs from 'highlight.js';

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

    return await md.render(mdText);
}

//TODO: add the ability to write articles in markdown and display to webpage