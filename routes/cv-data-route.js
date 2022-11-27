const express = require('express');
const router = express.Router();
const { con } = require('../app/configDB');

let sql = "SELECT * FROM cv_data";

router.get('/', function(req, res) {
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result)
  });
});

module.exports = router;