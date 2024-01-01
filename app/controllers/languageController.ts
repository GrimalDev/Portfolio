//get all the languages
import poolDB from "../config/configDB.ts";
import type {Language} from "../models/Language.ts";

export function getAllLanguages() : Promise<Language> {
  return new Promise((resolve, reject) => {
    poolDB.query("SELECT * FROM languages", (err, languages) => {
      if (err) reject(err);
      resolve(languages);
    });
  });
}