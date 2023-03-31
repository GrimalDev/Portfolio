import express from 'express';
import {getArticles} from "../app/controllers/articlesController.js";
import {logVisit} from "../app/controllers/logsController.js";
const router = express.Router()

/* GET doc page. */
router.get('/', logVisit, async function(req, res, next) {
    const articles = await getArticles({
        categories: [8],
        pageNumber: 'all'
    });

    res.render('veille', { articles: articles.articles });
});
export default router;