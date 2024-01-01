//log middleware to save logs in db
import poolDB from "../config/configDB.ts";
import {type Request, type Response, type NextFunction} from "express";

export function logVisit(req : Request, _res : Response, next : NextFunction) {
    const logsQuery = "INSERT INTO logs_visit (ip, url) VALUES (?, ?)";

    let routeVisited = req.originalUrl;
    const ipUsed = req.headers['x-forwarded-for'] || req.socket.remoteAddress ; // Ip with reverse proxy traefik
    // const ipUsed = req.ip; // Ip without reverse proxy traefik

    //if ip is from uptimebot or googlebot, don't save it in db
    //TODO: analyse it with whois
    if (ipUsed === "216.144.248.22" || ipUsed === "::ffff:216.144.248.22") {
        next();
        return;
    }

    //ignore assets loggings
    //if between first / and second / is javascripts, stylesheets, images, fonts, etc
    const assetsVisibly: { [asset: string]: boolean }  = {
        javascripts: false,
        stylesheets: false,
        images: false,
        fonts: false,
        favicon: false,
        libs: false,
        model: false,
        webmanifest: false
    };
    let isAsset = false;

    //select the initial route part between first / and second /#
    // if there is no second / select the whole route
    const routePart = routeVisited.split("/")[1];

    Object.keys(assetsVisibly).forEach((asset : string) => {
        if (routePart.includes(asset) && !assetsVisibly[asset]) {
            isAsset = true;
        }
    });

    if (isAsset) {
        next();
        return;
    }

    //control if url is longer than 499 characters (max length in db) and cut it if it is and add [...] at the end
    if (routeVisited.length > 499) {
        routeVisited = routeVisited.substring(0, 489) + "[...]";
    }

    poolDB.query(logsQuery, [ipUsed, routeVisited], (err, _logs) => {
        if (err) {
            console.error(err);
        }
        next();
    });
}

export async function getAllLogs() {
  return new Promise((resolve, reject) => {
    //get logs from db
    const logsQuery = "SELECT * FROM logs_visit ORDER BY visit_time DESC LIMIT 10;";
    poolDB.query(logsQuery, async (err, logs) => {
      if (err) {
        return reject(err);
      }

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

      return resolve(logs);
    });
  });
}