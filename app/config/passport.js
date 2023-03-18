import passport from "passport";
import { Strategy as LocalStrategy} from 'passport-local'
import {validPassword} from "../helpers/userHelpers.js";
import con from "./configDB.js";

/*passport IS*/
const verifyCallback = async (username, password, done) => {
    //TODO: Pass message on auth failure
    con.query('SELECT * FROM users WHERE username=?', [username], async function (error, results, fields) {
        if (error) { return done(error) }

        //verify if user exists
        if (results.length == 0) { return done(null, false); }

        //verify if password is good
        const isValid = await validPassword(password, results[0].hash);

        //control the user object for the rest of the app
        const user = {
            id: results[0].id,
            username: results[0].username,
            // hash: results[0].hash,
            role: results[0].role
        };

        if (!isValid) { return done(null, false); }

        return done(null, user);
    });
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
        con.query('SELECT * FROM users where id = ?', [userId], function(error, rows) {
            done(error, rows[0].id);
        });
    });
}

export default passportConfig