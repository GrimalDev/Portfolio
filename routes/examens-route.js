import express from 'express';
import {getProjects} from "../app/controllers/projectController.js";
const router = express.Router();

/* GET articles page. */
router.get('/', async function (req, res, next) {

    const projects = await getProjects({
        categories: [4, 5],
        pageNumber: 'all'
    });

    const projectsE4 = projects.projects.filter(project => project.categories === 4);
    //TODO: no mission 5: bug fix in projects controller to be done
    const projectsE5 = projects.projects.filter(project => project.categories === 5);

    res.render('examens', {
        projectsE4: projectsE4,
        projectsE5: projectsE5
    });
});

export default router;