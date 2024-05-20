const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema(
  {
    files: Array,
    text: String,
    links: Array,
  },
  { timestamps: true }
);

const Chatbot = mongoose.model('Chatbot', chatbotSchema);
module.exports = Chatbot;
