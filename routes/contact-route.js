import express from 'express';
import sgMail from '@sendgrid/mail';
import {sendContactFormDB, verifyContactForm} from "../app/controllers/contactController.js";
const router = express.Router();

/* GET doc page. */
router.get('/', function(req, res, next) {
    res.render('contact');
});

router.post('/', verifyContactForm, sendContactFormDB, async function (req, res, next) {

  //send mail contact@baptistegrimaldi.com
  // using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: {
      email: 'contact@baptistegrimaldi.com',
      name: 'Baptiste Grimaldi',
    },
    from: {
      email: 'no-reply@baptistegrimaldi.com',
      name: 'Baptiste Grimaldi',
    },
    templateId: 'd-8880bc3646d34d59b0c5f85de370b452',
    dynamicTemplateData: {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      message: req.body.message
    }
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent successfully from ' + req.body.email);
    })
    .catch((error) => {
      console.error(error);
    })

  res.json({
      status: 'ok',
      message: 'Message sent successfully'
  });
});

export default router;