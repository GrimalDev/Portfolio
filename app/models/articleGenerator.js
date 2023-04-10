import RssParser from 'rss-parser';
import {Configuration, OpenAIApi} from 'openai';
import dotenv from 'dotenv';

await dotenv.config({path: './../../.env'});

export function phraeToSlug(str) {
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

function rssToArticles(rss) {
  return rss.items.map(item => {

    //define all the fields of the article
    let slug = phraseToSlug(item.title);
    let title = item.title;
    let link = item.link;
    let pubDate = item.pubDate;
    let content = item['content:encoded'];

    //TODO: rephrase text in one short sentence for description less than 150 characters
    //TODO: translate to french
    //TODO: Put the link to the article in the content
    //TODO: rephrase the body
    //TODO: tags de theme

    return {
      slug: slug,
      title: title,
      body: content,
      created_at: pubDate
    };
  });
}

async function rephraseTextInFrench(text) {
  let response;
  const prompt = `
    Rewrite this article using simple words and clear language.
    The article is in HTML format, so you can remove the HTML tags, and must keep the html structure.
    Do not touch the links and images.
    Answer only the answer, no introductory sentence.
    Here is the article:
    ${text}<!endoftext>
  `;

  //setup openai api client
  const openaiConfig = await new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = await new OpenAIApi(openaiConfig);

  //Get the response from openai and handle errors
  //TODO: retry with exponential backoff (see: backoff npm package)
  try {
    response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 2048,
      n: 1,
      stop: '<!endoftext>',
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

  //when no data
  if (!response) {
    return '';
  }

  return response.data.choices[0].text.trim();
}

export default async function generateArticles() {
  const rss = await rssFetcher('https://sreeninet.wordpress.com/category/docker/feed/');
  return rssToArticles(rss);
}

// const filteredRSS = await generateArticles();