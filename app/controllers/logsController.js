//log middleware to save logs in db
import poolDB from "../config/configDB.js";

export function logVisit(req, res, next) {
    const logsQuery = "INSERT INTO logs_visit (ip, url) VALUES (?, ?)";

    poolDB.query(logsQuery, [req.ip, req.originalUrl], (err, logs) => {
        if (err) throw err;
        next();
    });
}