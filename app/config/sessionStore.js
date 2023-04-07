import MySQLStore from 'express-mysql-session';
import session from "express-session";

//session store and authentication configuration
import poolDB from "./configDB.js";

const sessionStore = new MySQLStore({
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
    expiration: 86400000,// The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, poolDB);

const TWO_HOURS = 1000 * 60 * 60 * 2

export default session({
    key: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: TWO_HOURS
    },
    store: sessionStore,
})