const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = require('./user');
db.feedback = require('./feedback');
db.history = require('./history');
db.tool = require('./tool');
db.chatbot = require('./chatbot');

module.exports = db;
