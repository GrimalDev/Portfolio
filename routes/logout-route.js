import express from 'express';
const router = express.Router()

/* GET doc page. */
router.get('/', function(req, res, next) {
    res.redirect('/');
});

export default router;