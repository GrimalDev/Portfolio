const express = require('express');
const router = express.Router();

/* GET articles page. */
router.get('/articles', function(req, res, next) {
  res.render('articles');
});

module.exports = router;
