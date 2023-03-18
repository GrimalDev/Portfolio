import express from 'express';
import {isAuth} from "../app/helpers/userHelpers.js";
const router = express.Router()

/* GET doc page. */
router.get('/logout', isAuth, function(req, res, next) {
    req.session.destroy(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

export default router;