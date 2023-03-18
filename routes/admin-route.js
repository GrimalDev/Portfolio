import express from 'express';
import {isAuth, isAdmin} from "../app/helpers/userHelpers.js";
const router = express.Router()

/* GET cv page. */
router.get('/', isAuth, isAdmin, function (req, res, next) {
    res.render('admin', {user: req.user});
});

export default router;