const express = require('express');
const router = express.Router();

/* GET projects page. */
router.get('/projects', function(req, res, next) {
  res.render('projects');
});

module.exports = router;
