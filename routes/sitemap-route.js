import express from 'express';
import * as fs from "fs";
import path from "path";
const router = express.Router();

//sitemap route
router.get('/', function(req, res) {
  //get the sitemap xml
  const sitemapXML = fs.readFileSync('public/sitemap.xml', 'utf8');

  //res the sitemap xml
  res.type('application/xml');
  res.send(sitemapXML);
});

export default router;