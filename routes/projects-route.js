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

    let message = "Unvalid query string";
    let searchParams = {
        languages: [],
        page: 1,
        customSearch: "",
        setParams(languages, page, customSearch = "") {
            this.languages = languages;
            this.page = page;
            this.customSearch = customSearch;
        }
    }

    //default value
    if (!req.query.length) {
        searchParams.setParams([], 1);
        message = "First page of projects";
    }

    //page
    if (req.query.page && req.query.length === 1) {
        searchParams.setParams([], req.query.page);
        message = "All projects by page";
    }

    //language query
    if (req.query.languages) {
        searchParams.setParams(req.query.languages.split(','), 1);
        message = "Projects by languages";
    }

    //page and language query
    if (req.query.languages && req.query.page) {
        searchParams.setParams(req.query.languages.split(','), req.query.page);
        message = "Projects by languages and page";
    }

    //todo: search bar query
    if (req.query.search) {
        searchParams.setParams([], 1, req.query.search);
        message = "Projects by search";
    }

    //execute query
    const queryResult = await getProjectsByLanguage(searchParams.languages, searchParams.page);

    //set the number of pages to display and the projects to display
    const maxPages = queryResult.maxPages;
    const projects = queryResult.projects;

    res.json({message: message, data: projects, maxPages: maxPages});
});

router.get('/view/:slug', async function(req, res, next) {
  const project = await getProjectBySlug(req.params.slug);
  res.json(project);
});

export default router;