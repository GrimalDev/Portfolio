import express from 'express';
import passport from "passport";
import {isAuth, isNotAuth} from "../app/helpers/userHelpers.js";
import {getUserById} from "../app/controllers/userController.js";
import {logVisit} from "../app/controllers/logsController.js";
const router = express.Router()

/* GET doc page. */
router.get('/login', logVisit, isNotAuth, async function(req, res, next) {
    res.render('login');
});

router.post('/login',isNotAuth, passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/account/login'
}));

export default router;