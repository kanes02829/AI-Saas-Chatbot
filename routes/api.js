const express = require('express');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // maximum of 200 requests per windowMs
});

let app = express.Router();

const authJwt = require('./auth/authJwt');

// Webhooks and things
app.use('/stripe', require('./stripe/index'));

app.use('/', apiLimiter);

// Signup and Authentication
app.use('/auth', require('./auth/index'));

// Everything after this requires user authentication
app.use('/', authJwt.verifyToken);

// Already signed up user routes
app.use('/user', require('./user/index'));

// Using AI Platform
app.use('/ai', require('./ai/index'));

app.use('/document', require('./document/index'));

// Saas feature
app.use('/settings', require('./settings/index'));

app.use(express.static(__dirname + '/public'));

module.exports = app;
