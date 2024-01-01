import express from 'express';
import moment from "moment";
import {isAuth, isAdmin} from "../app/models/userHelpers.js";
import poolDB from "../app/config/configDB.js";
import {getUserById} from "../app/controllers/userController.js";
import {getAllLanguages} from "../app/controllers/languageController.js";
import {getAllCategories, getProjects} from "../app/controllers/projectsController.js";
import {getAllLogs} from "../app/controllers/logsController.js";
const router = express.Router()

/* GET cv page. */
router.get('/', isAuth, isAdmin, async function (req, res, next) {
  const logs = await getAllLogs();
  const user = await getUserById(req.user);
  const languages = await getAllLanguages();
  const categories = await getAllCategories();
  const allProjects = await getProjects({categories: [4]});


  res.render('admin', {
    user: user,
    logs: logs,
    projectsInfos : {
      allProjects: allProjects,
      languages: languages,
      categories: categories
    }
  });
});

//select logs between dates
router.post('/logs/select', isAuth, isAdmin, async function (req, res, next) {
    let {from, to} = req.body;

    //convert date to timestamp with moment
    from = moment(from, "DD/MM/YYYY H:i:s").unix();
    to = moment(to, "DD/MM/YYYY H:i:s").unix();

    const logsQuery = "SELECT * FROM logs_visit WHERE visit_time >= ? AND visit_time <= ?";
    poolDB.query(logsQuery, [from, to], (err, logs: any) => {
        if (err) throw err;

        res.render('admin', {
            user: req.user,
            logs: logs
        });
    });
});

//route to delete log
router.post('/logs/del', isAuth, isAdmin, async function (req, res, next) {
    let {id} = req.body;

    const logsQuery = "DELETE FROM logs_visit WHERE id = ?";
    poolDB.query(logsQuery, [id], (err) => {
        if (err) throw err;

        res.redirect('/admin');
    });
});

export default router;