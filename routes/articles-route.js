import express from "express";
import poolDB from "../app/config/configDB.js";
import markdownTranslate, {
  markdownToPdf,
} from "../app/models/markdown-translate.js";
import {
  getArticleBySlug,
  getArticles,
} from "../app/controllers/articlesController.js";
import { pdfCachePath, readPdfCache } from "../app/models/pdf-cache.js";
const router = express.Router();

/* GET articles page. */
router.get("/", function (req, res, next) {
  const sql = "SELECT * from articles";
  poolDB.query(sql, async (err, articles) => {
    if (err) throw err;

    //loop through articles and convert boy md to html
    for (let i = 0; i < articles.length; i++) {
      articles[i].body = await markdownTranslate(articles[i].body);
      articles[i].description = await markdownTranslate(
        articles[i].description,
      );

      //convert date to string dd/mm/yyyy of client's locale
      articles[i].date = new Date(articles[i].date).toLocaleDateString();
    }

    res.render("articles", { articles: articles });
  });
});

router.get("/query", async function (req, res, next) {
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
    },
  };

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
    searchParams.categories = req.query.categories.split(",");
  }

  //query option for the database
  const queryOptions = {
    pageNumber: searchParams.page,
    customSearch: searchParams.customSearch,
    categories: searchParams.categories,
  };

  //execute query
  const queryResult = await getArticles(queryOptions);

  //set the number of pages to display and the projects to display
  const maxPages = queryResult.maxPages;
  const articles = queryResult.articles;
  const message = searchParams.toString();

  //convert the body and the description from markdown to html
  for (let i = 0; i < articles.length; i++) {
    articles[i].body = await markdownTranslate(articles[i].body);
    articles[i].description = await markdownTranslate(articles[i].description);
  }

  res.json({ message: message, data: articles, maxPages: maxPages });
});

router.get("/view/:slug", async function (req, res, next) {
  const article = await getArticleBySlug(req.params.slug);

  if (!article) {
    res.render("not-found");
    return;
  }

  //If the body contains {{!!fooFilePath!!}} it will be replaced by the content of the file foo.html file path file
  //The root is the articles folder (public/articles_media/direct_images)
  const regex = /\{\{\!\!.*?\!\!\}\}/g;
  if (article.body.match(regex)) {
    const matches = article.body.match(regex);
    for (let i = 0; i < matches.length; i++) {
      const filePath = matches[i].replace("{{!!", "").replace("!!}}", "");

      //replace de placeholder with the actual html content of the html in the articles path in an iframe
      article.body = article.body.replace(
        matches[i],
        `<iframe src="/articles_html/${filePath}" id="article-body__iframe"></iframe>`,
      );
    }
  } else {
    article.body = await markdownTranslate(article.body);
  }

  //convert the description from markdown to html
  article.description = await markdownTranslate(article.description);

  res.render("content-single", { project: article, route: "articles" });
});

//get pdf version
router.get("/pdf/:slug", async function (req, res, next) {
  try {
    //check if the article exists
    const article = await getArticleBySlug(req.params.slug);
    if (!article) {
      res.render("not-found");
      return;
    }

    //serve the cached PDF when it exists, otherwise generate and cache it
    let resultPdf = readPdfCache(article.slug);

    if (!resultPdf) {
      const createdAt = new Date(article.created_at).toLocaleDateString(
        "fr-FR",
        { day: "2-digit", month: "2-digit", year: "numeric" },
      );
      const body = `# ${article.title}\n## ${article.description}(${createdAt})\n\n${article.body}`;

      resultPdf = await markdownToPdf(body, pdfCachePath(article.slug), {
        output: "raw",
      });
    }

    //send pdf file to the client
    res.set({
      "Content-Disposition": `inline; filename=${article.slug}.pdf`,
      "Content-Type": "application/pdf",
    });
    res.send(resultPdf);
  } catch (error) {
    console.error("PDF generation error:", error);
    res
      .status(503)
      .send("PDF generation is temporarily unavailable. Please try again later.");
  }
});

export default router;

