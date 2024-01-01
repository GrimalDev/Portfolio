import passport from "passport";
import { Strategy as LocalStrategy} from 'passport-local'
import {validPassword} from "../models/userHelpers.js";
import poolDB from "./configDB.ts";
import {getUserByUsername} from "../controllers/userController.js";
import type {User} from "../models/User.ts";

/*passport IS*/
const verifyCallback = async (username: string, password: string, done: (arg0: null, arg1: boolean|User) => any) => {
    //TODO: Pass message on auth failure
    //get user from db
    const user:User = <User>(await getUserByUsername(username));

    //verify if user exists
    if (!user) { return done(null, false); }

    //verify if password is good
    const isValid = await validPassword(password, user.hash);

    if (!isValid) { return done(null, false); }

    return done(null, user);
};

export const passportConfig = () => {
    //How the user is authenticated
    const strategy = new LocalStrategy(verifyCallback);

    passport.use(strategy);

    //This function is called when the user is authenticated
    passport.serializeUser((user, done) => {
        // @ts-ignore
    done(null, user.id);
    });

    //This function is called when the user logs out
    passport.deserializeUser(function(userId, done) {
        poolDB.query('SELECT * FROM users where id = ?', [userId], (err, rows : User[]) => {
            done(err, rows[0].id);
        });
    });
}

export default passportConfig