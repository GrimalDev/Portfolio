import express from 'express';
import {sendContactFormDB, verifyContactForm} from "../app/controllers/contactController.js";
import {logVisit} from "../app/controllers/logsController.js";
const router = express.Router()

/* GET doc page. */
router.get('/', logVisit, function(req, res, next) {
    res.render('contact');
});

router.post('/', verifyContactForm, sendContactFormDB, async function (req, res, next) {
    res.json({
        status: 'ok',
        message: 'Message sent successfully'
    });
});

export default router;