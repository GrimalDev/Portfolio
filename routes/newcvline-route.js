import express from 'express';
import con from "../app/configDB.js";
const router = express.Router()

let sql = "INSERT INTO cv_data SET ?";

/* GET cv page. */
router.post('/', function(req, res, next) {
    // res.send(req.body);
    let newCvLine = {
        content: req.body.title,
        content_level: req.body.content_level,
    };

    con.query(sql, newCvLine, (err, response) => {
        if (err) throw err;
        res.redirect('/cv');
    });
});

export default router;
