import poolDB from "../config/configDB.js";

export async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        poolDB.query('SELECT * FROM users WHERE username=?', [username], (err, result) => {
            if (err) { return reject(err); }
            if (result.length === 0) { return resolve(null); }
            if (!result[0]) { return resolve(null); }

            //control the user object for the rest of the app
            return resolve({
                id: result[0].id,
                username: result[0].username,
                hash: result[0].hash,
                role: result[0].role
            });
        });
    });
}

export async function getUserById(id) {
    return new Promise((resolve, reject) => {
        poolDB.query('SELECT * FROM users WHERE id=?', [id], (err, result) => {
            if (err) { return reject(err); }
            if (result.length === 0) { return resolve(null); }
            if (!result[0].id) { return resolve(null); }

            //control the user object for the rest of the app
            return resolve({
                id: result[0].id,
                username: result[0].username,
                hash: result[0].hash,
                role: result[0].role
            });
        });
    });
}