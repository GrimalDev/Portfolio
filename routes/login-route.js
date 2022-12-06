import express from 'express';
const router = express.Router()

/* GET doc page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function (req, res, next) {
    res.send(req.body.username)
});

export default router;