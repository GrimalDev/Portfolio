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

export async function getNumberOfPages(searchSQLQuery, nPerPage = 8) {
    let query = {
        sql: "SELECT COUNT(*) as counter FROM projects",
        values: [],
    };

    query.sql += searchSQLQuery.sql.split("projects")[1];
    query.values = searchSQLQuery.values;

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
export async function getProjectsByLanguage(languages, pageNumber, customSearch) {
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

    languages = languages.join(','); // join the languages array to a string

    // Build the SQL query
    const query = {
        sql: 'SELECT * FROM projects',
        values: [],
    };

    //If a custom search is provided, filter the query by the search string
    if (customSearch !== "") {
        customSearch = '%' + customSearch + '%';
        //query sql for anything that contains the search string
        query.sql += ' WHERE title LIKE ?';
        query.values.unshift(customSearch);

        // query.values.unshift(customSearch);
    }

    // If languages are provided, filter the query by languages
    if (languages.length > 0) {
        languages = '(' + languages + ')'; //wrap the languages in parenthesis
        //if a custom search is provided, add the AND clause
        if (customSearch !== "") {
            query.sql += ' AND';
            // query.values.splice(1, 0, languages)
        } else {
            query.sql += ' WHERE';
            // query.values.unshift(languages) //apend the languages to the values array at the beginning
        }
        //TODO: bindparam instead of string concatenation
        query.sql += ' languages_linked IN ' + languages;
    }

    //verify if the page number is not too high
    const maxPages = await getNumberOfPages(query);

    //Make sure max page is more or equal to 1 else, return because there is no projects
    if (maxPages < 1) {
        return { projects: [], maxPages: 1 };
    }

    if (pageNumber > maxPages) {
        pageNumber = maxPages;
    }

    const perPage = 8; // number of projects per page
    const offset = (pageNumber - 1) * perPage; // calculate the offset
    
    //add the limit and offset to the values array
    query.values.push(perPage, offset);

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