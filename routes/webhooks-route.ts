import express from 'express';
import {gitFetchHandler} from "../app/webhooks/gitFetchProject.js";
import webhookAuth from "../app/middleware/webhookAuth.js";
const router = express.Router();

/* GET home page. */
router.get('/update', webhookAuth, function(req, res, next) {
  console.log('VALID update webhook received');
  // gitFetchHandler(req, res, next);
});

export default router;