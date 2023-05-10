import poolDB from "../config/configDB.js";

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

export async function getArticleById(id) {
    const sql = "SELECT * from articles WHERE id = ?";
    return new Promise((resolve, reject) => {
        poolDB.query(sql, [id], (err, result) => {
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
        sql: "SELECT COUNT(*) as counter FROM",
        values: [],
    };

    query.sql += searchSQLQuery.sql.split("FROM")[1];
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

    // Build the SQL query
    const query = {
        sql: `SELECT articles.id as id, articles.slug, articles.title, articles.description, articles.body, articles.img, categories.id as categories_linked, articles.created_at
                FROM articles
                JOIN articles_links_to_categories ON articles.id = articles_links_to_categories.article_id
                JOIN categories ON articles_links_to_categories.category_id = categories.id`,
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
        const categoriesPlaceholders = categories.map(() => "?").join(", "); // create placeholders for each category

        //if WHERE is not in sql query, put WHERE clause else put AND clause
        const sqlLinkingWord = query.sql.search("WHERE") === -1 ? "WHERE" : "AND";

        // add the WHERE clause with placeholders to the existing query
        query.sql += ` ${sqlLinkingWord} categories.id IN (${categoriesPlaceholders})`;

        // add the category values to the existing values array
        query.values = query.values.concat(categories);
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

    //order by date
    query.sql += ' ORDER BY articles.created_at DESC';

    return new Promise((resolve, reject) => {
        // Get the articles
        poolDB.query(query.sql, query.values, async (err, articles) => {
            if (err) {
                reject(err);
            }

            resolve({ articles: articles, maxPages: maxPages });
        });
    });
}

export async function saveArticle(article) {
    const sql = "INSERT INTO articles SET ?";
    return new Promise((resolve, reject) => {
        poolDB.query(sql, [article], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export async function updateArticle(article) {
  const sql = "UPDATE articles SET ? WHERE id = ?";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, [article, article.id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function deleteArticle(id) {
  const sql = "DELETE FROM articles WHERE id = ?";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function getCategories() {
  const sql = "SELECT * FROM categories";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function getCategoriesByArticleId(id) {
  const sql = "SELECT categories.id, categories.name FROM categories JOIN articles_links_to_categories ON categories.id = articles_links_to_categories.category_id WHERE articles_links_to_categories.article_id = ?";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function getRSSArticlesByWeek(week) {
  const sql = "SELECT articles.id, articles.slug, articles.title, articles.description, articles.body, articles.img, articles.created_at FROM articles JOIN articles_links_to_categories altc on articles.id = altc.article_id JOIN categories on categories.id = altc.category_id WHERE categories.id = 9  AND WEEKOFYEAR(articles.created_at) = ?";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, [week], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function addArticleToCategory(articleId, categoryId) {
  const sql = "INSERT INTO articles_links_to_categories SET ?";
  return new Promise((resolve, reject) => {
    poolDB.query(sql, [{ article_id: articleId, category_id: categoryId }], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}