const express = require('express');
const router = express.Router();

/* GET doc page. */
router.get('/doc', function(req, res, next) {
  res.render('doc');
});

module.exports = router;
