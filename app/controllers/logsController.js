//log middleware to save logs in db
import poolDB from "../config/configDB.js";

export function logVisit(req, res, next) {
    const logsQuery = "INSERT INTO logs_visit (ip, url) VALUES (?, ?)";

    const routeVisited = req.originalUrl;
    const ipUsed = req.headers['x-forwarded-for'] || req.socket.remoteAddress ; // Ip with reverse proxy traefik
    // const ipUsed = req.ip; // Ip without reverse proxy traefik

    //if ip is from uptimebot or googlebot, don't save it in db
    //TODO: analyse it with whois
    if (ipUsed === "::ffff:216.144.248.22" ) {
        next();
        return;
    }

    //ignore assets loggings
    //if between first / and second / is javascripts, stylesheets, images, fonts, etc
    const assetsVisibly = {
        "javascripts": false,
        "stylesheets": false,
        "images": false,
        "fonts": false,
        "favicon": false,
        "libs": false,
        "model": false,
        "webmanifest": false
    };
    let isAsset = false;

    //select the initial route part between first / and second /
    // if there is no second / select the whole route
    const routePart = routeVisited.split("/")[1];

    Object.keys(assetsVisibly).forEach((asset) => {
        if (routePart.includes(asset) && assetsVisibly[asset] === false) {
            isAsset = true;
        }
    });

    if (isAsset) {
        next();
        return;
    }

    poolDB.query(logsQuery, [ipUsed, routeVisited], (err, logs) => {
        if (err) throw err;
        next();
    });
}