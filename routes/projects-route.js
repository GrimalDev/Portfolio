import express from 'express';
const router = express.Router()

/* GET projects page. */
router.get('/', function(req, res, next) {
  res.render('projects');
});

export default router;