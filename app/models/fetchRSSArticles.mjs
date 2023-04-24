import RssParser from 'rss-parser';
import {htmlToMarkdown} from "./markdown-translate.js";

import dotenv from "dotenv";
dotenv.config({path: '/Users/thehiddengeek/WebstormProjects/Portfolio/.env'});

import {addArticleToCategory, getArticleBySlug, getCategories, saveArticle} from "../controllers/articlesController.js";

function phraseToSlug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
  const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

async function rssFetcher(url) {
  const parser = new RssParser();
  return await parser.parseURL(url);
}

async function rssToArticles(rss) {
  let rssArticles = [];

  for (let item of rss.items) {
    //if the article is older than 9th september 2020, ignore it
      if (new Date(item.pubDate) < new Date('2020-09-09')) {
        continue;
    }

    //define all the fields of the article
    let slug = phraseToSlug(item.title);
    let title = item.title;
    let link = item.link;
    let pubDate = new Date(item.pubDate);
    let content = item['content:encoded'] || item.content;

    //convert body to markdown
    content = await htmlToMarkdown(content);

    rssArticles.push({
      slug: slug,
      title: title,
      description: `This article was fetched from an [rss](${link}) feed`,
      body: content,
      img: 'rss-docker.webp',
      created_at: pubDate
    });
  }

  return rssArticles;
}

async function generateArticles(rssFeedUrl) {
  let rssFeed = [];

  try {
    //fetch the rss feed
    rssFeed = await rssFetcher(rssFeedUrl);
  } catch (e) {
    console.error(e);
    process.exit();
  }

  if (!rssFeed) {
    //stop the program
    console.log('No new rss articles found');
    process.exit();
  }

  return await rssToArticles(rssFeed);
}

const articles = await generateArticles('https://www.docker.com/feed/');

// send articles to the database
// add article in articles table and rss category articles_links_to_categories table

//get id of rss category
const rssCategoryId = await getCategories().then(categories => {
  for (let category of categories) {
    if (category.name === 'rss') {
      return category.id;
    }
  }
});

if (!rssCategoryId) {
  throw new Error('rss category not found');
}

//add articles to the database
for (let article of articles) {
  //save the last inserted article id
  let lastInsertedArticleId;

  //check if article already exists
  if (await getArticleBySlug(article.slug)) {
    continue;
  }

  console.log(`Adding article ${article.slug} to the database`);

  //add article to the database
  await saveArticle(article).then(article => {
    lastInsertedArticleId = article.insertId;
  });

  //add article to the rss category
  await addArticleToCategory(lastInsertedArticleId, rssCategoryId);

  //confirm end of article
  console.log(`OK`);
}

//stop the script
process.exit();