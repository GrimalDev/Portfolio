import express from 'express';
import {isAuth, isAdmin, userExists, genPassword} from "../app/helpers/userHelpers.js";
import poolDB from "../app/config/configDB.js";
const router = express.Router()

/* GET doc page. */
router.get('/register', isAuth, isAdmin, function(req, res, next) {
    res.render('register');
});

router.post('/register', isAuth, isAdmin, userExists, async function (req, res, next) {
    const hash = await genPassword(req.body.password);

    poolDB.query("INSERT INTO users (username, hash, role) VALUES (?, ?, ?)", [req.body.username, hash, 'USER'], (err, result) => {
        if (err) throw err;
        else {
            console.log("User created");
            res.redirect('/account/login');
        }
    });
});

export default router;