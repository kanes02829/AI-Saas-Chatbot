const express = require('express');
const openai = require('../../middlewares/openai');

let app = express.Router();

app.post('/blog/blog_ideas', async (req, res, next) => {
  try {
    let { blog, language, quality, voice, result, length } = req.body;
    let prompt =
      `Create ${result} groups of  10 ${voice} Blog Ideas about ${blog} in ${language}, which is related to ${quality}.` +
      `Max Results Length: ${length}`;

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
    console.log(err);
  }
});

module.exports = app;