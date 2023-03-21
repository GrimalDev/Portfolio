import express from 'express';
import poolDB from "../app/config/configDB.js";
import markdownTranslate from "../app/models/markdown-translate.js";
const router = express.Router()

const sql = "SELECT * from articles";

/* GET articles page. */
router.get('/', function(req, res, next) {
  poolDB.query(sql, async (err, articles) => {
    if (err) throw err;

    //loop through articles and convert boy md to html
    for (let i = 0; i < articles.length; i++) {
      articles[i].body = await markdownTranslate(articles[i].body);
    }

    res.render('articles', {articles: articles});
  })
});

export default router;