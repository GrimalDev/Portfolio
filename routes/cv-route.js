const express = require('express');
const router = express.Router();

/* GET cv page. */
router.get('/', function(req, res, next) {
  res.render('cv');
});

module.exports = router;
