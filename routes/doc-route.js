import express from 'express';
const router = express.Router()

/* GET doc page. */
router.get('/', function(req, res, next) {
  res.render('doc');
});

export default router;