import passport from "passport";
import { Strategy as LocalStrategy} from 'passport-local'
import {validPassword} from "../helpers/userHelpers.js";
import poolDB from "./configDB.js";
import {getUserByUsername} from "../controllers/userController.js";

/*passport IS*/
const verifyCallback = async (username, password, done) => {
    //TODO: Pass message on auth failure
    //get user from db
    const result = await getUserByUsername(username);

    //verify if user exists
    if (!result) { return done(null, false); }

    //verify if password is good
    const isValid = await validPassword(password, result.hash);

    //control the user object for the rest of the app
    const user = {
        id: result.id,
        username: result.username,
        // hash: result.hash,
        role: result.role
    };

    if (!isValid) { return done(null, false); }

    return done(null, user);
};

export const passportConfig = () => {
    //How the user is authenticated
    const strategy = new LocalStrategy(verifyCallback);

    passport.use(strategy);

    //This function is called when the user is authenticated
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    //This function is called when the user logs out
    passport.deserializeUser(function(userId, done) {
        poolDB.query('SELECT * FROM users where id = ?', [userId], function(error, rows) {
            done(error, rows[0].id);
        });
    });
}

export default passportConfig