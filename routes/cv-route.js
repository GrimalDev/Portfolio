import express from 'express';
import con from "../app/config/configDB.js";
const router = express.Router()

/* GET cv page. */
router.get('/', function(req, res, next) {
    res.render('cv');
});

//Get the cv data from the database
router.get('/data', function(req, res) {
    const sql = "SELECT content, content_level FROM cv_data";

    con.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result)
    });
});

export default router;
