import express from 'express';
import con from "../app/configDB.js";
const router = express.Router()

let sql = "SELECT * from admins WHERE `username` = ?";
/* GET cv page. */
router.post('/', function (req, res, next) {

    let user = {
        username: req.body.username,
        password: req.body.password
    }

    con.query(sql, user.username, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            if (result[0].password === user.password) {
                res.render('admin', { userConnected: user.username });
            }
        } else {
            res.redirect('/login');
        }
    });
});

export default router;