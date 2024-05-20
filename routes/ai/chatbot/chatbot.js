const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
require('dotenv-flow').config();

const request = require('request');
const cheerio = require('cheerio');

const db = require('../../models/index');
const Chatbot = db.chatbot;
const User = db.user;

const { PineconeClient } = require('@pinecone-database/pinecone');

const xlsx = require('xlsx');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { CSVLoader } = require('langchain/document_loaders/fs/csv');
const { S3Loader } = require('langchain/document_loaders/web/s3');
const {
  PuppeteerWebBaseLoader,
} = require('langchain/document_loaders/web/puppeteer');

// const {
//   CheerioWebBaseLoader,
// } = require('langchain/document_loaders/web/cheerio');

const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { OpenAI } = require('langchain/llms/openai');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { AIChatMessage, HumanChatMessage } = require('langchain/schema');
const Bottleneck = require('bottleneck');
const { LLMChain } = require('langchain/chains');

const AWS = require('aws-sdk');

const fs = require('fs');
const util = require('util');
const { SavingsPlans } = require('../../../node_modules/aws-sdk/index');

// const {
//   S3Client,
//   PutObjectCommand,
//   HeadObjectCommand,
//   DeleteObjectCommand,
// } = require('@aws-sdk/client-s3');

let app = express.Router();

// uploading files
const upload = multer({ dest: 'uploads/' });

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

// const client = new S3Client({
//   credentials: {
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey,
//   },

//   region: region,
// });

// const DIR = './uploads/';
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, DIR);
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname.toLowerCase().split(' ').join('-');
//     cb(null, uuidv4() + '-' + fileName);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype === 'application/pdf' ||
//       file.mimetype === 'text/plain' ||
//       file.mimetype === 'application/msword' ||
//       file.mimetype ===
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
//       file.mimetype === 'text/csv' ||
//       file.mimetype === 'application/vnd.ms-excel' ||
//       file.mimetype ===
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(
//         new Error(
//           'Only .pdf, .txt, .doc, .docx, .csv, .xls and .xlsx format allowed!'
//         )
//       );
//     }
//   },
// });

// Chatbot APIs

// const uploadFiles = async (req, res, next) => {
//   console.log(req.files);
//   const files = req.files;
//   const len = files.length;
//   let fileInfo = [];

//   files.forEach((file, index) => {
//     if (!file) {
//       // return res
//       //   .status(200)
//       //   .json({ code: 500, message: 'Please choose the file', data: [] });
//       return;
//     }

//     console.log('bucketName: ', bucketName);

//     const fileStream = fs.createReadStream(file.path);
//     const params = {
//       Bucket: bucketName,
//       Key: req.body.pathname[index] + '/' + file.originalname,
//       // Key: file.pathname,
//       Body: fileStream,
//     };

//     s3.upload(params, (err, data) => {
//       if (err) {
//         console.log(` ${file.originalname} file uploading is failed.`);
//         // res
//         //   .status(200)
//         //   .json({ code: 500, message: 'Uploading is failed!', data: [] });
//         return;
//       }
//       fileInfo.push({
//         origin: req.files[index].originalname,
//       });
//       console.log(`File uploaded successfully. ${data.Location}`);
//       if (len - 1 === index) {
//         res.status(200).json({
//           code: 200,
//           message: ` ${file.originalname} file uploaded successfully.`,
//           data: {
//             origin: file.originalname,
//           },
//         });
//       }
//     });
//   });
// };

const uploadFile = async (req, res, next) => {
  console.log(req.file);
  const file = req.file;
  let fileInfo = [];

  if (!file) {
    return res
      .status(200)
      .json({ code: 500, message: 'Please choose the file', data: [] });
  }

  console.log('pathname: ', req.body.pathname);

  const fileStream = fs.createReadStream(file.path);
  const params = {
    Bucket: bucketName,
    Key: req.body.pathname + '/' + file.originalname,
    // Key: file.pathname,
    Body: fileStream,
  };

  s3.upload(params, async (err, data) => {
    if (err) {
      console.log(` ${file.originalname} file uploading is failed.`);
      // res
      //   .status(200)
      //   .json({ code: 500, message: 'Uploading is failed!', data: [] });
      return;
    }
    fileInfo.push({
      origin: file.originalname,
    });

    const savingPath = await User.updateOne(
      { _id: req.body.ownerId },
      {
        $push: {
          'invitation.0.uploadedFilePath': {
            path: req.body.pathname + '/' + file.originalname,
          },
        },
      }
    );
    console.log('savingPath: ', savingPath);
    console.log(`File uploaded successfully. ${data.Location}`);

    res.status(200).json({
      code: 200,
      message: ` ${file.originalname} file uploaded successfully.`,
      data: {
        origin: file.originalname,
      },
    });
  });
};

const deleteFile = async (req, res, next) => {
  console.log(req.body);
  const { pathname, ownerId } = req.body;

  if (!pathname) {
    return res
      .status(200)
      .json({ code: 500, message: 'Please choose the file', data: [] });
  }

  console.log('pathname: ', pathname);

  s3.deleteObject({ Bucket: bucketName, Key: pathname }, async (err, data) => {
    if (err) {
      console.log(` file deleting is failed.`);
      // res
      //   .status(200)
      //   .json({ code: 500, message: 'Uploading is failed!', data: [] });
      return;
    }

    const deletingPath = await User.updateOne(
      { _id: ownerId },
      {
        $pull: {
          'invitation.0.uploadedFilePath': {
            path: pathname,
          },
        },
      }
    );
    console.log('deletingPath: ', deletingPath);
    console.log(`File deleted successfully.`);

    res.status(200).json({
      code: 200,
      message: `file deleted successfully.`,
      data: [],
    });
  });
};

const crawlLinks = (req, res) => {
  let { URL } = req.body; // Replace with the desired URL
  console.log('url: ', URL);

  // Make a request to the specified URL
  request(URL, (error, response, html) => {
    // Handle any potential errors or non-200 status code
    if (error) {
      console.error(error);
      // res.status(500).send('An error occurred');
      res.status(200).json({
        code: 500,
        data: [],
        message: 'An error occurred',
      });
      return;
    }

    if (response.statusCode !== 200) {
      res
        .status(response.statusCode)
        .send(`Request failed with status code ${response.statusCode}`);
      return;
    }

    const $ = cheerio.load(html);

    const hrefs = [];
    console.log('hrefs: ', hrefs);
    $('a').each((index, element) => {
      hrefs.push($(element).attr('href'));
    });
    console.log(hrefs);
    // Send the hrefs array as a JSON response
    res.status(200).json({
      data: hrefs,
    });
  });
};

const limiter = new Bottleneck({
  minTime: 50,
});

const summarizerTemplate = `Shorten the text in the CONTENT, attempting to answer the INQUIRY You should follow the following rules when generating the summary:
  - The summary will answer the INQUIRY. If it cannot be answered, the summary should be empty, AND NO TEXT SHOULD BE RETURNED IN THE FINAL ANSWER AT ALL.
  - If the CONTENT does not include any information related to INQUIRY, final answer must be empty.
  - The summary should be under 4000 characters but if CONTENT does not include any information related to INQUIRY, final answer must be empty.
  - The summary should be 2000 characters long, but if CONTENT does not include any information related to INQUIRY, final answer must be empty.

  INQUIRY: {inquiry}
  CONTENT: {document}

  Final answer:
  `;

const summarizerDocumentTemplate = `Summarize the text in the CONTENT. You should follow the following rules when generating the summary:
  - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
  - The summary should be under 4000 characters.
  - The summary should be at least 1500 characters long, if possible.

  CONTENT: {document}

  Final answer:
  `;

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }
  return chunks;
};

const summarize = async ({ document, inquiry, onSummaryDone }) => {
  const llm = new OpenAI({
    concurrency: 10,
    temperature: 0,
    modelName: 'gpt-3.5-turbo',
  });

  const promptTemplate = new PromptTemplate({
    template: inquiry ? summarizerTemplate : summarizerDocumentTemplate,
    inputVariables: inquiry ? ['document', 'inquiry'] : ['document'],
  });
  const chain = new LLMChain({
    prompt: promptTemplate,
    llm,
  });

  try {
    const result = await chain.call({
      prompt: promptTemplate,
      document,
      inquiry,
    });
    onSummaryDone && onSummaryDone(result.text);
    return result.text;
  } catch (e) {
    console.log(e);
  }
};

const rateLimitedSummarize = limiter.wrap(summarize);

const summarizeLongDocument = async ({ document, inquiry, onSummaryDone }) => {
  const templateLength = inquiry
    ? summarizerTemplate.length
    : summarizerDocumentTemplate.length;
  try {
    if (document.length + templateLength > 4000) {
      const chunks = chunkSubstr(document, 4000 - templateLength - 1);
      let summarizedChunks = [];
      summarizedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          let result;
          if (inquiry) {
            result = await rateLimitedSummarize({
              document: chunk,
              inquiry,
              onSummaryDone,
            });
          } else {
            result = await rateLimitedSummarize({
              document: chunk,
              onSummaryDone,
            });
          }
          return result;
        })
      );

      const result = summarizedChunks.join('\n');

      if (result.length + templateLength > 4000) {
        return await summarizeLongDocument({
          document: result,
          inquiry,
          onSummaryDone,
        });
      } else {
        return result;
      }
    } else {
      return document;
    }
  } catch (e) {
    throw e;
  }
};

const jsonToConversation = (json) => {
  const conversation = [];

  for (let i = 0; i < json.length; i++) {
    if (json[i].role === 'user') {
      if (i === json.length - 1) {
        continue;
      }
      conversation.push(new HumanChatMessage(json[i].content));
    } else {
      conversation.push(new AIChatMessage(json[i].content));
    }
    conversation.push(new AIChatMessage(json[i].content));
  }

  return conversation;
};

// function downloadFile(bucketName, fileName) {
//   const params = {
//     Bucket: bucketName,
//     Key: fileName,
//   };

//   s3.getObject(params, (err, data) => {
//     if (err) {
//       console.log(err, err.stack);
//     } else {
//       fs.writeFile('uploads/' + fileName, data.Body, (error) => {
//         if (error) {
//           console.log(error);
//         } else {
//           console.log('File saved successfully in uploads/' + fileName);
//         }
//       });
//     }
//   });
// }

const getObjectAsync = util.promisify(s3.getObject).bind(s3);

async function downloadFile(files) {
  for (const file of files) {
    const params = {
      Bucket: bucketName,
      Key: file.origin,
    };

    console.log('files: ', file.origin);
    try {
      const data = await getObjectAsync(params);
      await fs.promises.writeFile('uploads/' + file.origin, data.Body);
      console.log('File downloaded successfully in uploads/' + file.origin);
    } catch (error) {
      console.log(error, error.stack);
    }
  }
  return true;
}

async function handleFiles(files, vectorStore) {
  for (const file of files) {
    let loader;
    const ext = file.origin.split('.')[1];

    if (ext === 'pdf') {
      loader = new PDFLoader('uploads/' + file.origin, { splitPages: false });
    } else if (ext === 'doc' || ext === 'docx') {
      loader = new DocxLoader('uploads/' + file.origin);
    } else if (ext === 'txt') {
      loader = new TextLoader('uploads/' + file.origin);
    } else if (ext === 'csv') {
      loader = new CSVLoader('uploads/' + file.origin);
    } else if (ext === 'xls' || ext === 'xlsx') {
      vectorStore = await handleXlsxFile(file, vectorStore);
      continue;
    } else {
      continue;
    }
    const docs = await loader.load();
    const output = await splitAndTruncate(docs, file.origin);
    vectorStore = vectorStore.concat(output);
  }
  // console.log('link: ', vectorStore);
  return vectorStore;
}

// async function handleFiles(files, vectorStore) {
//   for (const file of files) {
//     let loader;
//     const ext = file.filename.split('.')[1];

//     if (ext === 'pdf') {
//       loader = new PDFLoader('uploads/' + file.filename, { splitPages: false });
//     } else if (ext === 'doc' || ext === 'docx') {
//       loader = new DocxLoader('uploads/' + file.filename);
//     } else if (ext === 'txt') {
//       loader = new TextLoader('uploads/' + file.filename);
//     } else if (ext === 'csv') {
//       loader = new CSVLoader('uploads/' + file.filename);
//     } else if (ext === 'xls' || ext === 'xlsx') {
//       vectorStore = await handleXlsxFile(file, vectorStore);
//       continue;
//     } else {
//       continue;
//     }
//     const docs = await loader.load();
//     const output = await splitAndTruncate(docs, file.origin);
//     vectorStore = vectorStore.concat(output);
//   }
//   // console.log('link: ', vectorStore);
//   return vectorStore;
// }

async function handleXlsxFile(file, vectorStore) {
  const workbook = xlsx.readFile('uploads/' + file.origin);
  let workbook_sheet = workbook.SheetNames;
  let res = xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]]);
  let temp = '';
  for (let i = 0; i < res.length; i++) {
    temp.concat(JSON.stringify(res[i]).replaceAll(',', '\n'));
  }
  const output = await splitAndTruncate([{ pageContent: temp }], file.origin);

  return vectorStore.concat(output);
}

async function handleText(text, vectorStore) {
  const output = await splitAndTruncate([{ pageContent: text }], 'Plain Text');
  console.log('link: ', output);
  return vectorStore.concat(output);
}

function getHTML(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (error) {
        reject(error);
      } else {
        resolve(html);
      }
    });
  });
}

function parseHTML(html) {
  const $ = cheerio.load(html);
  const mainElement = $('main'); // Assuming main is the desired element to extract

  if (mainElement.length) {
    return mainElement.text();
  }

  return $('body').text();
}

// async function handleLinks(links, vectorStore) {
//   console.log('handleLniks');
//   console.log('prelink: ', links);
//   const promises = links.map(async (link) => {
//     const html = await getHTML(link.url);
//     const docs = await parseHTML(html);
//     // console.log('docs: ', docs);
//     return splitAndTruncate(docs, link.url);
//   });

//   const results = await Promise.all(promises);
//   console.log('nowlink: ', results);
//   return vectorStore.concat([].concat(...results));
// }

async function handleLinks(links, vectorStore) {
  const promises = links.map(async (link) => {
    const loader = new PuppeteerWebBaseLoader(link.url, {
      launchOptions: {
        headless: 'new',
        args: ['--no-sandbox'],
      },
      async evaluate(page) {
        const result = await page.evaluate(() => {
          const scripts = document.body.querySelectorAll('script');
          const noscript = document.body.querySelectorAll('noscript');
          const styles = document.body.querySelectorAll('style');
          const scriptAndStyle = [...scripts, ...noscript, ...styles];
          scriptAndStyle.forEach((e) => e.remove());

          const mainElement = document.querySelector('main');
          return mainElement ? mainElement.innerText : document.body.innerText;
        });
        console.log('result: ', result);
        return result;
      },
    });

    // const loader = new CheerioWebBaseLoader(link.url, {
    //   selector: 'main',
    // });
    const docs = await loader.load();
    // console.log(docs);
    return splitAndTruncate(docs, link.url);
  });
  const results = await Promise.all(promises);
  // console.log('link: ', results);
  return vectorStore.concat([].concat(...results));
}

const truncateStringByBytes = (str, bytes) => {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

const sliceIntoChunks = (arr, chunkSize) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

async function splitAndTruncate(docs, url) {
  // const ks = docs[0];
  // console.log('ks: ', ks);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 10,
  });
  const pageContent = docs[0].pageContent;
  console.log('pageContent: ', pageContent);
  const output = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        url,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return output;
}

const getEmbedding = async (doc) => {
  const embedder = new OpenAIEmbeddings({
    modelName: 'text-embedding-ada-002',
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const embedding = await embedder.embedQuery(doc.pageContent);
  // console.log('embedder: ', embedding);
  return {
    id: uuidv4(),
    values: embedding,
    metadata: {
      chunk: doc.pageContent,
      text: doc.metadata.text,
      url: doc.metadata.url,
    },
  };
};

const rateLimitedGetEmbedding = limiter.wrap(getEmbedding);

// const uploadFiles = async (req, res, next) => {
//   if (!req.files || req.files.length === 0) {
//     return res
//       .status(200)
//       .json({ code: 400, message: 'Please choose the file', data: [] });
//   }

//   console.log('bucketName: ', bucketName);
//   const files = req.files;
//   // console.log('files: ', files);

//   const promises = files.map(async (file) => {
//     const fileStream = fs.createReadStream(file.path);

//     const params = {
//       Bucket: bucketName,
//       Key: file.originalname,
//       Body: fileStream,
//     };

//     try {
//       const data = await s3.upload(params);
//       console.log(data);

//     } catch (err) {

//     }
//   })

//   const results = await Promise.all(promises);

// };

// const uploadFiles = async (req, res, next) => {
//   try {
//     const reqFiles = [];
//     const fileInfo = [];
//     const url = req.protocol + '://' + req.get('host');
//     for (var i = 0; i < req.files.length; i++) {
//       // reqFiles.push(url + '/uploads/' + req.files[i].filename);
//       let count = 0;
//       if (req.files.length === 1) {
//         count = Number(req.body.characters);
//       } else {
//         count = Number(req.body.characters[i]);
//       }
//       fileInfo.push({
//         filename: req.files[i].filename,
//         origin: req.files[i].originalname,
//         characters: count,
//       });
//     }
//     console.log('fileInfo: ', fileInfo);
//     res.status(200).json({
//       code: 200,
//       data: fileInfo,
//       message: 'It is uploaded successfully',
//     });
//   } catch (err) {
//     console.log('uploadsError: ', err);
//     res.status(200).json({
//       code: 500,
//       error: err,
//       message: 'Uploading is failed!',
//     });
//   }
// };

// const crawlLinks = async (req, res, next) => {
//   // const browser = await puppeteer.launch({
//   //   headless: 'true',
//   //   args: ['--no-sandbox'],
//   // });
//   console.log('Hello', req.body);

//   const browser = await puppeteer.launch({
//     headless: 'true',
//     args: ['--no-sandbox'],
//   });
//   const page = await browser.newPage();
//   let { URL } = req.body;
//   if (!URL.startsWith('http://') && !URL.startsWith('https://')) {
//     URL = 'https://www.' + URL;
//   }
//   try {
//     if (URL) {
//       await page.goto(URL, { waitUntil: 'load', timeout: 0 });

//       const linkHrefs = await page.$$eval('a', (links) =>
//         links.map((link) => link.href)
//       );
//       const templinks = [];

//       linkHrefs.map((linkHref) => {
//         if (linkHref.includes(URL)) {
//           templinks.push(linkHref.split('#')[0]);
//         }
//       });

//       const links = [...new Set(templinks)];
//       console.log(linkHrefs);
//       await browser.close();
//       res.status(200).json({
//         data: linkHrefs,
//       });
//     }
//   } catch (err) {
//     console.log('CrawlError: ', err);
//     await browser.close();
//     res.status(500).json({
//       message: 'An error occurred while crawling website.',
//     });
//   }
// };

const createChatbot = async (req, res, next) => {
  try {
    const { content, links } = req.body;
    const tempFiles = req.body.files;
    // console.log('tempFiles: ', tempFiles);
    // console.log('length: ', tempFiles.length);
    let files;
    let vectorStore = [];
    if (tempFiles.length !== 0) {
      files = tempFiles;
      const downloaded = await downloadFile(files);
      // console.log('downloaded: ', downloaded);
      vectorStore = await handleFiles(files, vectorStore);
      return;
      // return res.status(200).json({
      //   success: true,
      //   message: 'Successfully found all documents',
      //   // data: vectorStore,
      // });
    }

    if (content.length !== 0) {
      vectorStore = await handleText(content, vectorStore);
    }

    if (links.length !== 0) {
      vectorStore = await handleLinks(links, vectorStore);
      return res.status(200).json({
        success: true,
        message: 'Successfully found all documents',
        // data: vectorStore,
      });
    }
    if (vectorStore.length) {
      // let textdata = '';
      // vectorStore.map((vector) => {
      //   textdata = textdata.concat(vector.pageContent);
      // });

      // console.log('textdata: ', textdata.length);
      // if (textdata.length > process.env.LIMITATION_CHARACTERS) {
      //   return res.status(400).json({
      //     message: `You can use only ${process.env.LIMITATION_CHARACTERS} characters for your custom bot.`,
      //   });
      // } else {
      const newChatbot = new Chatbot({
        files: files,
        text: content,
        links: links,
      });
      await newChatbot.save();

      let vectors = [];
      await Promise.all(
        vectorStore.flat().map(async (doc) => {
          const vector = await rateLimitedGetEmbedding(doc);
          vectors.push(vector);
        })
      );
      // return res.status(200).json({
      //   success: true,
      //   message: 'Successfully found all documents',
      //   // data: vectorStore,
      // });
      const chunks = sliceIntoChunks(vectors, 10);
      const pinecone = new PineconeClient();
      await pinecone.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });

      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
      const botId = await Chatbot.findOne();
      const namespace = botId._id.toString();

      // console.log('namespace: ', namespace);
      // console.log('pineconeIndex: ', pineconeIndex);
      await Promise.all(
        chunks.map(async (chunk) => {
          console.log('chunk: ', chunk);
          await pineconeIndex.upsert({
            upsertRequest: {
              namespace: namespace,
              vectors: chunk,
            },
          });
        })
      );
      // console.log('tempFiles: ', tempFiles);
      // console.log('length: ', tempFiles.length);
      res.status(200).json({
        code: 200,
        message: 'Chatbot is successfully created',
        botId: newChatbot._id,
      });

      // }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ code: 500, message: 'Internal server error', data: [] });
  }
};

const getReply = async (req, res, next) => {
  // const baseprompt = 'Hi! What can I help you with?';
  const baseprompt = 'Show your speciality in details';
  const messages = req.body;
  // console.log(messages[0]);

  const query = messages[messages.length - 1].content;

  const conversationHistory = jsonToConversation(messages);

  const botId = await Chatbot.findOne();
  let namespace;
  if (botId) {
    namespace = botId._id;
    // console.log('namespace: ', namespace);
  } else {
    console.log('ssssssssssssssss');
  }

  const pinecone = new PineconeClient();

  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

  // await pineconeIndex.delete1({
  //   deleteAll: true,

  //   namespace: '65207f430060d87284f50811',
  // });
  // return res.status(200).json({
  //   success: true,
  //   message: 'Successfully found all documents',
  //   // data: vectorStore,
  // });

  const llm = new OpenAI({});

  // res.writeHead(200, {
  //   'Content-Type': 'text/event-stream',
  //   'Cache-Control': 'no-cache, no-transform',
  //   Connection: 'keep-alive',
  // });

  // const sendData = (data, chatId) => {
  //   const response = {
  //     chatId: chatId,
  //     data: data,
  //   };
  //   res.write(`data: ${JSON.stringify(response)}\n\n`);
  // };

  // /- The answer should only be based on the CONTEXT. Do not use any external sources. Do not generate the response based on the question without clear reference to the context.
  //     - Do not make up any answers if the CONTEXT does not have relevant information.
  //     - ${baseprompt}
  // inquiryTemplate
  // - Ignore any conversation log that is not directly related to the user prompt.
  // - The question should be a single sentence
  //     - Always include the source at the end of the answer. The format is Source: [SOURCE]. The SOURCE is same as the "url" field of CONTENT. If the format of "url" field website_url then format of SOURCE is same as website_url. If the format of "url" field is the youtube_url then the format of SOURCE is same as youtube_url. If the format of the url "field" is file_name or "Plain Text" then don't provide the SOURCE.
  try {
    const inquiryTemplate = `Given the following user prompt and conversation log, formulate a question that would be the most relevant to provide the user with an answer from a knowledge base.
    You should follow the following rules when generating and answer:
    - Always prioritize the user prompt over the conversation log.
    - Only attempt to answer if a question was posed.
    - You should remove any punctuation from the question
    - You should remove any words that are not relevant to the question
    - If you are unable to formulate a question, respond with the same USER PROMPT you got.

    USER PROMPT: {userPrompt}

    CONVERSATION LOG: {conversationHistory}

    Final answer:
    `;

    const qaTemplate = `Answer the question based on the context below. You should follow ALL the following rules when generating and answer:
    - There will be a CONVERSATION LOG, CONTEXT, and a QUESTION.
    - The final answer must always be styled using markdown.
    - Your main goal is to point the user to the right source of information based on the CONTEXT you are given.
    - Your secondary goal is to provide the user with an answer that is relevant to the question.
    - Provide the user with a code example that is relevant to the question, if the context contains relevant code examples. Do not make up any code examples on your own.
    - Take into account the entire conversation so far, marked as CONVERSATION LOG, but prioritize the CONTEXT.
    - Based on the CONTEXT, choose the source that is most relevant to the QUESTION.
    - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
    - The CONTEXT is a set of JSON objects, each includes the field "text" where the content is stored, and "url" where the url of the page is stored.
    - Do not mention the CONTEXT or the CONVERSATION LOG in the answer, but use them to generate the answer.
    - ALWAYS prefer the result with the highest "score" value.
    - Ignore any content that is stored in html tables.
    - Summarize the CONTEXT to make it easier to read, but don't omit any information.
    - Don't provide a link if it is not found in the CONTEXT.
    - Correspond kind greetings when receving greeting
    - If no relevant information is found, provide a general response from OpenAI based on gpt-3.5-turobo model.

     CONVERSATION LOG: {conversationHistory}

     CONTEXT: {summaries}

     QUESTION: {question}

     URLS: {urls}

     Final Answer: `;

    // const qaTemplate = `Given the conversation history, summaries, question, and URLs provided, the aim is to generate
    //  a well-informed answer. If the context contains relevant information, provide the user with accurate details, including code examples if applicable.
    //  If no relevant information is found, provide a general response from OpenAI based on gpt-3.5-turobo model.

    // CONVERSATION LOG: {conversationHistory}

    // CONTEXT: {summaries}

    // QUESTION: {question}

    // URLS: {urls}

    // Final Answer: `;

    const inquiryChain = new LLMChain({
      llm,
      prompt: new PromptTemplate({
        template: inquiryTemplate,
        inputVariables: ['userPrompt', 'conversationHistory'],
      }),
    });
    const inquiryChainResult = await inquiryChain.call({
      userPrompt: query,
      conversationHistory,
    });
    const inquiry = inquiryChainResult.text;

    const embedder = new OpenAIEmbeddings({
      modelName: 'text-embedding-ada-002',
    });

    const embeddings = await embedder.embedQuery(inquiry);
    const queryRequest = {
      vector: embeddings,
      topK: 3,
      namespace: namespace,
      includeMetadata: true,
    };

    const queryResult = await pineconeIndex.query({ queryRequest });

    const matches =
      queryResult.matches?.map((match) => ({
        ...match,
        metadata: match.metadata,
      })) || [];

    const urls =
      matches &&
      Array.from(
        new Set(
          matches.map((match) => {
            const metadata = match.metadata;
            const { url } = metadata;
            return url;
          })
        )
      );

    const docs =
      matches &&
      Array.from(
        matches.reduce((map, match) => {
          const metadata = match.metadata;
          const { text, url } = metadata;
          if (!map.has(url)) {
            map.set(url, text);
          }
          return map;
        }, new Map())
      ).map(([_, text]) => text);

    const promptTemplate = new PromptTemplate({
      template: qaTemplate,
      inputVariables: ['summaries', 'question', 'conversationHistory', 'urls'],
    });

    const chat = new ChatOpenAI({
      // streaming: true,
      verbose: true,
      temperature: 0.3,
      // topP: topP,
      frequencyPenalty: 0.3,
      presencePenalty: 0.5,
      // maxTokens: maxTokens,
      modelName: 'gpt-3.5-turbo',
      openAIApiKey: process.env.OPENAI_API_KEY,
      // callbackManager: CallbackManager.fromHandlers({
      //   async handleLLMNewToken(token) {
      //     sendData(token, chatId);
      //   },
      // }),
    });

    const chain = new LLMChain({
      prompt: promptTemplate,
      llm: chat,
    });

    const allDocs = docs.join('\n');

    const summary =
      allDocs.length > 4000
        ? await summarizeLongDocument({ document: allDocs, inquiry })
        : allDocs;

    const result = await chain
      .call({
        summaries: summary,
        question: query,
        conversationHistory,
        urls,
      })
      .then(async (row) => {
        console.log('row: ', row.text);
        let message = [
          ...messages,
          ...[{ content: row.text, role: 'assistant' }],
        ];

        const response = {
          data: row.text,
        };
        return res.status(200).json({
          success: true,
          data: response.data,
        });
      });
  } catch (error) {
    console.log('error', error);
  } finally {
    res.end();
  }
};

/* GET users listing. */
app.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// app.post('/uploads', upload.array('files'), uploadFiles);
app.post('/uploads', upload.single('file'), uploadFile);
app.post('/deletefile', deleteFile);
app.post('/crawllinks', crawlLinks);
app.post('/createchatbot', createChatbot);
app.post('/getreply', getReply);

module.exports = app;
