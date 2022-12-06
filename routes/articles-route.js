import express from 'express';
import con from "../app/configDB.js";
import hljs from 'highlight.js';
import Markdown from 'markdown-it';
const router = express.Router()

const sql = "SELECT * from articles";

/* GET articles page. */
router.get('/', function(req, res, next) {
  con.query(sql, (err, articles) => {
    if (err) throw err;

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

    res.render('articles', { articles: articles });
  })
});

export default router;