import poolDB from "../config/configDB.js";
import mysql from "mysql";

export async function getArticleBySlug(slug) {
    const sql = "SELECT * from articles WHERE slug = ?";
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
        sql: "SELECT COUNT(*) as counter FROM articles",
        values: [],
    };

    query.sql += searchSQLQuery.sql.split("articles")[1];
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

//return collection of articles corresponding to the page number
//a page is a pack of 8 articles
//if no page number is provided, the first page is returned
//if the page number is too high, the last page is returned
//The function is nested to be sure that everything is retrieved before returning the result
export async function getArticles(options) {
    let pageNumber = options.pageNumber || 1; //if pageNumber is undefined, set it to 1
    let customSearch = options.customSearch || ""; //if customSearch is undefined, set it to an empty string
    let categories = options.categories || []; //if categories is undefined, set it to an empty array

    //protectors
    if (!pageNumber) {
        pageNumber = 1;
    }
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    //page not a number, if is string and is "all", all pages are returned, else set to 1
    if (isNaN(pageNumber) && pageNumber !== "all") {
        pageNumber = 1;
    }

    categories = categories.join(','); // join the categories array to a string

    // Build the SQL query
    const query = {
        sql: 'SELECT * FROM articles',
        values: [],
    };

    //If a custom search is provided, filter the query by the search string
    if (customSearch !== "") {
        customSearch = '%' + customSearch + '%';
        //query sql for anything that contains the search string
        query.sql += ' WHERE title LIKE ?';
        query.values.push(customSearch);
    }

    //if categories is provided
    if (categories.length > 0) {
        categories = '(' + categories + ')'; //wrap the categories in parenthesis

        //if WHERE is not in sql query, put WHERE clause else put AND clause
        if (query.sql.search("WHERE") === -1) {
            query.sql += ' WHERE';
        } else {
            query.sql += ' AND';
        }

        //TODO: bindparam instead of string concatenation
        query.sql += " categories_linked IN " + categories;
    }

    //set the maximum number of pages to 1
    let maxPages = 1;

    //When the page number is not "all", set the limit and offset
    if (pageNumber !== "all") {
        //verify if the page number is not too high
        maxPages = await getNumberOfPages(query);

        //Make sure max page is more or equal to 1 else, return because there is no articles
        if (maxPages < 1) {
            return { articles: [], maxPages: 1 };
        }

        if (pageNumber > maxPages) {
            pageNumber = maxPages;
        }

        const perPage = 8; // number of articles per page
        const offset = (pageNumber - 1) * perPage; // calculate the offset

        //add the limit and offset to the values array
        query.values.push(perPage, offset);

        // Add the LIMIT and OFFSET clauses
        query.sql += ' LIMIT ? OFFSET ?';
    }

    return new Promise((resolve, reject) => {
        // Get the articles
        poolDB.query(query.sql, query.values, async (err, articles) => {
            if (err) {
                return reject(err);
            }

            return resolve({ articles: articles, maxPages: maxPages });
        });
    });
}