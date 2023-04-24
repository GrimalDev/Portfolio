import express from 'express';
import moment from "moment";
import {isAuth, isAdmin} from "../app/models/userHelpers.js";
import poolDB from "../app/config/configDB.js";
const router = express.Router()

/* GET cv page. */
router.get('/', isAuth, isAdmin, async function (req, res, next) {
    //get logs from db
    const logsQuery = "SELECT * FROM logs_visit ORDER BY visit_time DESC LIMIT 10;";
    poolDB.query(logsQuery, async (err, logs) => {
        if (err) throw err;

        //loop through logs and replace timestamp with date
        for (let i = 0; i < logs.length; i++) {
            let displayDate = logs[i].visit_time;

            //add two hours to the date to get the correct time
            displayDate = displayDate.setHours(displayDate.getHours());

            //convert to local time in france
            displayDate = new Date(displayDate).toLocaleString("fr-FR", {timeZone: "Europe/Paris"});

            //replace timestamp with date
            logs[i].visit_time = displayDate;
        }

        res.render('admin', {
            user: req.user,
            logs: logs
        });
    });
});

//select logs between dates
router.post('/logs/select', isAuth, isAdmin, async function (req, res, next) {
    let {from, to} = req.body;

    //convert date to timestamp with moment
    from = moment(from, "DD/MM/YYYY H:i:s").unix();
    to = moment(to, "DD/MM/YYYY H:i:s").unix();

    const logsQuery = "SELECT * FROM logs_visit WHERE visit_time >= ? AND visit_time <= ?";
    poolDB.query(logsQuery, [from, to], (err, logs) => {
        if (err) throw err;

        res.render('admin', {
            user: req.user,
            logs: logs
        });
    });
});

//route to delete log
router.post('/logs/del', isAuth, isAdmin, async function (req, res, next) {
    let {id} = req.body;

    const logsQuery = "DELETE FROM logs_visit WHERE id = ?";
    poolDB.query(logsQuery, [id], (err, logs) => {
        if (err) throw err;

        res.redirect('/admin');
    });
});

export default router;