import RssParser from 'rss-parser';
import {htmlToMarkdown} from "../app/models/markdown-translate.js";

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
    console.log('pubDate', item.pubDate, ' | ', new Date(item.pubDate) < new Date('2020-09-09'));
      if (new Date(item.pubDate) < new Date('2020-09-09')) {
        continue;
    }

    //define all the fields of the article
    let slug = phraseToSlug(item.title);
    let title = item.title;
    let link = item.link;
    let pubDate = item.pubDate;
    let content = item['content:encoded'] || item.content;

    //convert body to markdown
    content = await htmlToMarkdown(content);

    //TODO: rephrase text in one short sentence for description less than 150 characters
    //TODO: translate to french
    //TODO: Put the link to the article in the content
    //TODO: rephrase the body
    //TODO: tags de theme

    rssArticles.push({
      slug: slug,
      title: title,
      body: content,
      created_at: pubDate
    });
  }

  return rssArticles;
}

export default async function generateArticles(rssFeedUrl) {
  const rssFeed = await rssFetcher(rssFeedUrl);

  return await rssToArticles(rssFeed);
}

const articles = await generateArticles('https://www.docker.com/feed/');

//get all this weeks articles, add them to the database if they don't exist
//Make a summary of the articles with chatgpt


