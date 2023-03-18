import con from "../config/configDB.js";

export async function getUserByUsername(username) {
    try {
        const results = await con.query('SELECT * FROM users WHERE username=?', [username]);

        if (results.length === 0) {
            return false;
        }

        //control the user object for the rest of the app
        return {
            id: results[0].id,
            username: results[0].username,
            hash: results[0].hash,
            role: results[0].role
        };
    } catch (e) {
        console.error(e)
    }
}

export async function getUserById(id) {
    try {
        const result = await con.query('SELECT * FROM users WHERE id=?', [id]);

        if (result.length === 0) {
            return false;
        }

        if (!result[0].id) { return false; }

        //control the user object for the rest of the app
        return {
            id: result[0].id,
            username: result[0].username,
            hash: result[0].hash,
            role: result[0].role
        };
    } catch (e) {
        console.error(e)
    }
}