import express from 'express';
const router = express.Router()

/* GET doc page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

export default router;