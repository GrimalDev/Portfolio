import express from 'express';
import {isAuth} from "../app/models/userHelpers.js";
const router = express.Router()

/* GET doc page. */
router.get('/logout', isAuth, function(req, res, next) {
    req.session.destroy(function (err: boolean | Error) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

export default router;