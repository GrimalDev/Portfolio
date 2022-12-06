import express from 'express';
const router = express.Router()

/* GET cv page. */
router.get('/', function (req, res, next) {
    res.render('admin', { userConnected: "GrimalDev" });
});

export default router;