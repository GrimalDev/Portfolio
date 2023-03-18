Object.keys(articles).forEach(async (key) => {
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

    if (articles[key].content_body) {
        const html = await md.render(articles[key].content_body);
        articles[key].content_body = html;
    }
});

//TODO: add the ability to write articles in markdown and display to webpage