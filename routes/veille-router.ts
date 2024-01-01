import express from 'express';
import {getArticles, getCategories} from "../app/controllers/articlesController.js";
import markdownTranslate from "../app/models/markdown-translate.js";
const router = express.Router()

/* GET doc page. */
router.get('/', async function(req, res, next) {
  let veilleId, rssId;

  await getCategories().then((categories) => {
    try {
      veilleId = categories.find((cat: { name: string; }) => cat.name === 'veille').id;
      rssId = categories.find((cat: { name: string; }) => cat.name === 'rss').id;
    } catch (e) {
      console.log(e);
    }
  });

  let articles = await getArticles({
      categories: [veilleId, rssId],
      pageNumber: 'all'
  });

  articles = articles.articles;

  // Convert markdown to html for each article body and description
  for (let i = 0; i < articles.length; i++) {
    articles[i].body = await markdownTranslate(articles[i].body);
    articles[i].description = await markdownTranslate(articles[i].description);
  }

  res.render('veille', { articles: articles });
});
export default router;