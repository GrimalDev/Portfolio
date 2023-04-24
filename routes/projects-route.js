import express from 'express';
import {
    getProjectBySlug,
    getProjects,
} from "../app/controllers/projectsController.js";
import {getAllLanguages} from "../app/controllers/languageController.js";
import markdownTranslate from "../app/models/markdown-translate.js";
import * as fs from "fs";
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

  //when no page is found, redirect to 404
  if (!project) {
      res.redirect('/error');
      return;
  }

  //If the body contains {{fooFilePath}} it will be replaced by the content of the file foo.html file path file
  //The root is the articles folder (public/articles_media/direct_images)
  const regex = /\{\{\!\!.*?\!\!\}\}/g;
  if (project.body.match(regex)) {
    const matches = project.body.match(regex);
    for (let i = 0; i < matches.length; i++) {
      const filePath = matches[i].replace("{{!!", "").replace("!!}}", "");

      // replace the placeholder with the actual html content of the html in the projects path in an iframe with notion fix stylesheet
      const iframe = `<iframe src="/articles_html/${filePath}" id="article-body__iframe"></iframe>`;
      project.body = project.body.replace(matches[i], iframe);
    }
  } else {
    //convert body from markdown to html
    project.body = await markdownTranslate(project.body);
  }

  //convert the description from markdown to html
  project.description = await markdownTranslate(project.description);

  res.render('project-single', {project: project});
});
export default router;