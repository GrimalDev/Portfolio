/*middleware*/
import bcrypt from "bcrypt";
import {getUserById, getUserByUsername} from "../controllers/userController.js";

export async function validPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export async function genPassword(password) {
    return await bcrypt.hash(password, 10);
}

export function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/account/login');
}

export function isNotAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

export function isAdmin(req, res, next) {
    if (req.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
}

export async function userExists(req, res, next) {
    //check if fields are set
    if (!req.body.username || !req.body.password) {
        res.json({message: 'Please enter all fields'});
    }

    if (await getUserByUsername(req.body.username) === false) {
        res.json({message: 'User already exists'});
    }

    next();
}