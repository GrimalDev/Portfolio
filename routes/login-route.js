import express from 'express';
import passport from "passport";
import {isAuth, isNotAuth} from "../app/models/userHelpers.js";
import {getUserById} from "../app/controllers/userController.js";
const router = express.Router()

/* GET doc page. */
router.get('/login', isNotAuth, async function(req, res, next) {
    res.render('login');
});

router.post('/login',isNotAuth, passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/account/login'
}));

export default router;