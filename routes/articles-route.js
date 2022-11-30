import express from 'express';
const router = express.Router()
/* GET articles page. */
router.get('/', function(req, res, next) {
  res.render('articles');
});

export default router;
