const express = require('express');
const {con} = require("../app/configDB");
const router = express.Router();

let sql = "SELECT * FROM (SELECT * FROM articles ORDER BY id DESC LIMIT 3) as r ORDER BY id"

/* GET home page. */
router.get('/', function(req, res, next) {
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.render('index', {
      pageHeader: "HOME",
      lastArticles: result
    } );

  });
});

module.exports = router;
