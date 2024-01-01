import express from 'express';
import {getProjects} from "../app/controllers/projectsController.js";
import markdownTranslate from "../app/models/markdown-translate.js";
const router = express.Router();

/* GET articles page. */
router.get('/', async function (req, res, next) {

    const projects = await getProjects({
        categories: [4, 5],
        pageNumber: 'all'
    });

    const projectsE4 = projects.projects.filter((project: { categories: number; }) => project.categories === 4);
    const projectsE5 = projects.projects.filter((project: { categories: number; }) => project.categories === 5);

    //convert the description from markdown to html
    for (let i = 0; i < projectsE4.length; i++) {
      projectsE4[i].description = await markdownTranslate(projectsE4[i].description);
    }
    //convert the description from markdown to html
    for (let i = 0; i < projectsE5.length; i++) {
      projectsE5[i].description = await markdownTranslate(projectsE5[i].description);
    }

    res.render('examens', {
        projectsE4: projectsE4,
        projectsE5: projectsE5
    });
});

export default router;