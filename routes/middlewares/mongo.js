// Export mongoose
require('dotenv-flow').config();

//Assign MongoDB connection string to Uri and declare options settings
let uri = `mongodb+srv://${process.env.MONGO_URL_NAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL_CLUSTER}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const db = require('../models/index');
const User = db.user;

console.log('uri: ', uri);

db.mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = db.mongoose.connection;

connection.once('open', () => {
  console.log('Connected to database');
});

// async function initial() {
//   console.log('xxxxxxxx');
//   try {
//     const count = await User.estimatedDocumentCount();
//     console.log(count);
//   } catch (err) {
//     console.log(err);
//   }

// User.estimatedDocumentCount((err, count) => {
//   console.log('xxxxxxxxxxxx');
//   if (!err && count === 0) {
//     new User({
//       email: 'admin@domain.com',
//       password:
//         '$2a$08$hVnfdemp6cpovhm0uOvDeOqPcwiO7Ek0SWcGqLwlTTytFRBg7C.TW', // KeepingHumanSafe101
//       accountType: 'admin',
//       fname: 'Admin',
//       lname: '',
//       accountType: 'admin',
//       plan: 'Ultimate',
//       status: 'active',
//       credits: 10000,
//     }).save((err) => {
//       if (err) {
//         console.log('error', err);
//       }
//       console.log('admin user added');
//     });
//     console.log('11111111111111');

//     new User({
//       email: 'support@openai.com',
//       password:
//         '$2a$08$hVnfdemp6cpovhm0uOvDeOqPcwiO7Ek0SWcGqLwlTTytFRBg7C.TW', // KeepingHumanSafe101
//       accountType: 'user',
//       fname: 'OpenAI',
//       lname: 'Support',
//       plan: 'Ultimate',
//       status: 'active',
//       credits: 1000,
//     }).save((err) => {
//       if (err) {
//         console.log('error', err);
//       }
//       console.log('admin user added');
//     });
//   }
// });
// }
