const express = require('express');
const openai = require('../../middlewares/openai');

let app = express.Router();

app.post('/blog/content_rephrase', async (req, res, next) => {
  try {
    console.log(req.body);
    let { rewrite, keyword, language, quality, voice, result, length } =
      req.body;
    let prompt = `Rephrase your content in a different voice and style to appeal to different readers. here, content is "${rewrite}", keywords are "${keyword}",Language is ${language}, Quality type is "${quality}", Tone of Voice is "${voice}", Number of Resuls is "${result}" and Max Results Length is "${length}" `;

    console.log(prompt);
    let inputRaw = '';
    const gptResponse = await openai.complete({
      engine: 'text-davinci-003',
      prompt,
      maxTokens: 1500,
      temperature: 0.8,
      frequencyPenalty: 0,
      presencePenalty: 0,
      bestOf: 1,
      topP: 1,
      n: 1,
      user: req.user._id,
      stream: false,
    });
    let output = `${gptResponse.data.choices[0].text}`;

    // If the output string ends with one or more hashtags, remove all of them
    if (output.endsWith('"')) {
      output = output.substring(0, output.length - 1);
    }

    // If the output string ends with one or more hashtags, remove all of them
    if (output.endsWith('"')) {
      output = output.substring(0, output.length - 1);
    }

    // remove a single new line at the end of output if there is one
    if (output.endsWith('\n')) {
      output = output.substring(0, output.length - 1);
    }

    req.locals.input = prompt;
    req.locals.inputRaw = inputRaw;
    req.locals.output = output;

    next();
  } catch (err) {
    console.log(err.response);
    console.log(err.data);
    console.log(err.message);
  }
});

module.exports = app;
