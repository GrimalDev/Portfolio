import express from 'express';
import con from "../app/configDB.js";
import hljs from 'highlight.js';
import Markdown from 'markdown-it';
const router = express.Router()

const sql = "SELECT * from projects";

/* GET articles page. */
router.get('/', function(req, res, next) {
  con.query(sql, (err, projects) => {
    if (err) throw err;

    res.render('projects', { projects: projects });
  })
});

export default router;