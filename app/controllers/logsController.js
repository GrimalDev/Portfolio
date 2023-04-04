//log middleware to save logs in db
import poolDB from "../config/configDB.js";

export function logVisit(req, res, next) {
    const logsQuery = "INSERT INTO logs_visit (ip, url) VALUES (?, ?)";

    const routeVisited = req.originalUrl;
    const ipUsed = req.headers['x-forwarded-for'] || req.socket.remoteAddress ; // Ip with reverse proxy traefik

    //if ip is from uptimebot or googlebot, don't save it in db
    //TODO: analyse it with whois
    if (ipUsed === "::ffff:216.144.248.22" ) {
        next();
        return;
    }

    poolDB.query(logsQuery, [ipUsed, routeVisited], (err, logs) => {
        if (err) throw err;
        next();
    });
}