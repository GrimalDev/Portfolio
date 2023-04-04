import express from 'express';
import {getArticles} from "../app/controllers/articlesController.js";
const router = express.Router()

/* GET doc page. */
router.get('/', async function(req, res, next) {
    const articles = await getArticles({
        categories: [8],
        pageNumber: 'all'
    });

    res.render('veille', { articles: articles.articles });
});
export default router;