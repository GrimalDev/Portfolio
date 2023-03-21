import express from 'express';
const router = express.Router()
import poolDB from "../app/config/configDB.js";

let sql = "SELECT * FROM (SELECT * FROM articles ORDER BY id DESC LIMIT 3) as r ORDER BY id"

/* GET home page. */
router.get('/', function(req, res, next) {
  poolDB.query(sql, (err, result) => {
    if (err) throw err;
    res.render('home', {
      pageHeader: "HOME",
      lastArticles: result
    } );

  });
});

export default router;