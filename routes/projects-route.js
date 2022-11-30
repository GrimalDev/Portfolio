const express = require('express');
const router = express.Router();

/* GET projects page. */
router.get('/', function(req, res, next) {
  res.render('projects');
});

module.exports = router;
