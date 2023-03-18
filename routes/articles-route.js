import express from 'express';
import con from "../app/config/configDB.js";
import hljs from 'highlight.js';
import Markdown from 'markdown-it';
const router = express.Router()

const sql = "SELECT * from articles";

/* GET articles page. */
router.get('/', function(req, res, next) {
  con.query(sql, (err, articles) => {
    if (err) throw err;

    res.render('articles', { articles: articles });
  })
});

export default router;