import {Configuration, OpenAIApi} from "openai";

export async function summarizeTextChunks(text, maxSize) {
  let response;
  const prompt = `
      Summarize the following text in less of exactly ${maxSize} characters.
      Only answer the question, do not include any type of introduction.
      Write in a effective way with technical accuracy.
      Text:
      ${text}
      <!endoftext>
  `;

  //setup openai api client
  const openaiConfig = await new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = await new OpenAIApi(openaiConfig);

  //Get the response from openai and handle errors
  //TODO: retry with exponential backoff (see: backoff npm package)
  try {
    response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
      n: 1,
      stop: '<!endoftext>',
    });
  } catch (error) {
    if (error.response) {
      console.warn(error.response.status);
      console.warn(error.response.data);
    } else {
      console.warn(error.message);
    }
  }

  //when no data
  if (!response) {
    return '';
  }

  return response.data.choices[0].message.content
}

export async function summarizeArrayOfTexts(texts) {
  let response;
  const prompt = `
      The texts sent are part of a bigger text. Write a text that develops the chunks together.
      Add definitions and explanations where needed.
      Do not include an introduction.
      Write with technical accuracy.
      <!endoftext>
  `;

  const messages = [];

  //add the texts to the messages array
  for (let text of texts) {
    messages.push({
      role: 'user',
      content: text,
    });
  }

  messages.push({
    role: 'system',
    content: prompt,
  });

  //setup openai api client
  const openaiConfig = await new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = await new OpenAIApi(openaiConfig);

  //Get the response from openai and handle errors
  try {
    response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      n: 1,
      stop: '<!endoftext>',
    });
  } catch (error) {
    if (error.response) {
      console.warn(error.response.status);
      console.warn(error.response.data);
    } else {
      console.warn(error.message);
    }
  }

  //when no data
  if (!response) {
    return '';
  }

  return response.data.choices[0].message.content
}