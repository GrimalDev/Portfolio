import express from 'express';
import poolDB from "../app/config/configDB.js";
import markdownTranslate from "../app/models/markdown-translate.js";
import {getArticleBySlug, getArticles} from "../app/controllers/articlesController.js";
const router = express.Router()

const sql = "SELECT * from articles";

/* GET articles page. */
router.get('/', function(req, res, next) {
  poolDB.query(sql, async (err, articles) => {
    if (err) throw err;

    //loop through articles and convert boy md to html
    for (let i = 0; i < articles.length; i++) {
      articles[i].body = await markdownTranslate(articles[i].body);
    }

    res.render('articles', {articles: articles});
  })
});

router.get('/query', async function(req, res, next) {
  //if no query string, the first 10 projects are displayed
  //if query string, the projects are filtered by the query string
  //if querry string is page, the projects are by pack of 10

  let searchParams = {
    page: 1,
    customSearch: "",
    categories: [],
    setParams(page, customSearch = "", categories = []) {
      this.page = page;
      this.customSearch = customSearch;
      this.categories = categories;
    },
    toString() {
      let page = this.page;
      let customSearch = this.customSearch;
      let categories = this.categories;
      if (customSearch === "") {
        customSearch = "None";
      }
      if (this.categories.length === 0) {
        categories = "all";
      }
      return `Page: ${page} + Custom search: ${customSearch} + Categories: ${categories}`;
    }
  }

  //default value
  if (!req.query.length) {
    searchParams.setParams(1);
  }

  //page
  if (req.query.page) {
    searchParams.page = req.query.page;
  }

  //custom search
  if (req.query.search) {
    searchParams.customSearch = req.query.search;
  }

  //categories
  if (req.query.categories) {
    searchParams.categories = req.query.categories.split(',');
  }

  //query option for the database
  const queryOptions = {
    pageNumber: searchParams.page,
    customSearch: searchParams.customSearch,
    categories: searchParams.categories
  }

  //execute query
  const queryResult = await getArticles(queryOptions);

  //set the number of pages to display and the projects to display
  const maxPages  = queryResult.maxPages;
  const articles  = queryResult.articles;
  const message   = searchParams.toString();

  res.json({message: message, data: articles, maxPages: maxPages});
});

router.get('/view/:slug', async function(req, res, next) {
  const article = await getArticleBySlug(req.params.slug);

  //detect if the article is a rss article, if rss article, keep body as html
  if (!article.description.includes("rss")) {
    //convert body from markdown to html
    article.body = await markdownTranslate(article.body);
  }

  res.render('project-single', {project: article});
});

export default router;