import express from 'express';
const router = express.Router()
import con from '../app/configDB.js'

const sql = "SELECT * FROM cv_data";

router.get('/', function(req, res) {
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result)
  });
});

export default router;