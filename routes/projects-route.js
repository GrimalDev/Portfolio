import express from 'express';
import {
    getProjectBySlug,
    getProjectsByLanguage,
} from "../app/controllers/projectController.js";
import {getAllLanguages} from "../app/controllers/languageController.js";
const router = express.Router();

/* GET articles page. */
router.get('/', async function (req, res, next) {

    const languages = await getAllLanguages();

    res.render('projects', {languages: languages});
});

router.get('/query', async function(req, res, next) {
    //if no query string, the first 10 projects are displayed
    //if query string, the projects are filtered by the query string
    //if querry string is page, the projects are by pack of 10

    let searchParams = {
        languages: [],
        page: 1,
        customSearch: "",
        setParams(languages, page, customSearch = "") {
            this.languages = languages;
            this.page = page;
            this.customSearch = customSearch;
        },
        toString() {
            return "Languages: " + this.languages + " Page: " + this.page + " Custom search: " + this.customSearch;
        }
    }

    //default value
    if (!req.query.length) {
        searchParams.setParams([], 1);
    }

    //page
    if (req.query.page) {
        searchParams.page = req.query.page;
    }

    //language query
    if (req.query.languages) {
        searchParams.languages = req.query.languages.split(',');
    }

    //todo: search bar query
    if (req.query.search) {
        searchParams.customSearch = req.query.search;
    }

    //execute query
    const queryResult = await getProjectsByLanguage(searchParams.languages, searchParams.page, searchParams.customSearch);

    //set the number of pages to display and the projects to display
    const maxPages = queryResult.maxPages;
    const projects = queryResult.projects;
    const message = queryResult.toString();

    res.json({message: message, data: projects, maxPages: maxPages});
});

router.get('/view/:slug', async function(req, res, next) {
  const project = await getProjectBySlug(req.params.slug);
  res.json(project);
});

export default router;