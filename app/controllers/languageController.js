//get all the languages
import poolDB from "../config/configDB.js";

export function getAllLanguages() {
  return new Promise((resolve, reject) => {
    poolDB.query("SELECT * FROM languages", (err, languages) => {
      if (err) reject(err);
      resolve(languages);
    });
  });
}