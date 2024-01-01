/*middleware*/
import bcrypt from "bcrypt";
import {getUserById, getUserByUsername} from "../controllers/userController.ts";

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

export async function isAdmin(req, res, next) {
    const user = await getUserById(req.user);
    if (!user) {
        res.redirect('/');
    }
    if (user.role !== 'ADMIN') {
        res.redirect('/');
    }
    next();
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