import express from 'express';
import {
    getProjectBySlug,
    getProjects,
} from "../app/controllers/projectController.js";
import {getAllLanguages} from "../app/controllers/languageController.js";
import markdownTranslate from "../app/models/markdown-translate.js";
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
        categories: [],
        setParams(languages, page, customSearch = "", categories = []) {
            this.languages = languages;
            this.page = page;
            this.customSearch = customSearch;
            this.categories = categories;
        },
        toString() {
            let languages = this.languages;
            let page = this.page;
            let customSearch = this.customSearch;
            let categories = this.categories;
            if (languages.length === 0) {
                languages = "all";
            }
            if (customSearch === "") {
                customSearch = "None";
            }
            if (this.categories.length === 0) {
                categories = "all";
            }
            return `Languages: ${languages} + Page: ${page} + Custom search: ${customSearch} + Categories: ${categories}`;
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
        languages: searchParams.languages,
        pageNumber: searchParams.page,
        customSearch: searchParams.customSearch,
        categories: searchParams.categories
    }

    //execute query
    const queryResult = await getProjects(queryOptions);

    //set the number of pages to display and the projects to display
    const maxPages  = queryResult.maxPages;
    const projects  = queryResult.projects;
    const message   = searchParams.toString();

    res.json({message: message, data: projects, maxPages: maxPages});
});

router.get('/view/:slug', async function(req, res, next) {
    const project = await getProjectBySlug(req.params.slug);

    //convert body from markdown to html
    project.body = await markdownTranslate(project.body);

    res.render('project-single', {project: project});
});

export default router;