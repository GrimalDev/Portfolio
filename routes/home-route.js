import express from 'express';
const router = express.Router();
import poolDB from "../app/config/configDB.js";
import markdownTranslate from "../app/models/markdown-translate.js";

let sql = "SELECT * FROM (SELECT * FROM articles ORDER BY id DESC LIMIT 3) as r ORDER BY id"

/* GET home page. */
router.get('/', function(req, res, next) {
  poolDB.query(sql, async (err, result) => {
    if (err) throw err;

    const latestArticles = result;

    //convert the description from markdown to html
    for (let i = 0; i < latestArticles.length; i++) {
      latestArticles[i].description = await markdownTranslate(latestArticles[i].description);
    }

    res.render('home', {
      pageHeader: "HOME",
      lastArticles: latestArticles
    });

  });
});

export default router;