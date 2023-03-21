import poolDB from "../config/configDB.js";
import mysql from "mysql";

export async function getProjectBySlug(slug) {
    const sql = "SELECT * from projects WHERE slug = ?";
    return new Promise((resolve, reject) => {
        poolDB.query(sql, [slug], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

export async function getNumberOfPages(languages = [], nPerPage = 8) {
    let query = {
        sql: "SELECT COUNT(*) as counter FROM projects",
        values: [],
    };
    languages = languages.join(','); //join the languages array to a string

    //if languages are provided, the query is filtered by languages
    if (languages.length > 0) {
        //TODO: bindparam instead of string concatenation
        query.sql += ' WHERE languages_linked IN (' + languages + ')';
        // query.values.unshift(languages) //apend the languages to the values array at the beginning
    }

    return new Promise((resolve, reject) => {
        poolDB.query(query.sql, query.values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(Math.ceil(result[0].counter / nPerPage));
            }
        });
    });
}

//return collection of projects corresponding to the page number
//a page is a pack of 8 projects
//if no page number is provided, the first page is returned
//if the page number is too high, the last page is returned
//The function is nested to be sure that everything is retrieved before returning the result
export async function getProjectsByLanguage(languages, pageNumber, customSearch = "") {
    //protectors
    if (!pageNumber) {
        pageNumber = 1;
    }
    //if not a number, set to 1
    if (isNaN(pageNumber)) {
        pageNumber = 1;
    }
    if (pageNumber < 1) {
        pageNumber = 1;
    }

    //verify if the page number is not too high
    const maxPages = await getNumberOfPages(languages);
    if (pageNumber > maxPages) {
        pageNumber = maxPages;
    }
    const perPage = 8; // number of projects per page
    const offset = (pageNumber - 1) * perPage; // calculate the offset
    languages = languages.join(','); // join the languages array to a string

    // Build the SQL query
    const query = {
        sql: 'SELECT * FROM projects',
        values: [perPage, offset],
    };

    // If languages are provided, filter the query by languages
    if (languages.length > 0) {
        //TODO: bindparam instead of string concatenation
        query.sql += ' WHERE languages_linked IN (' + languages + ')';
        // query.values.unshift(languages) //apend the languages to the values array at the beginning
    }

    // Add the LIMIT and OFFSET clauses
    query.sql += ' LIMIT ? OFFSET ?';

    return new Promise((resolve, reject) => {
        // Get the projects
        poolDB.query(query.sql, query.values, async (err, projects) => {
            if (err) {
                return reject(err);
            }

            return resolve({ projects: projects, maxPages: maxPages });
        });
    });
}