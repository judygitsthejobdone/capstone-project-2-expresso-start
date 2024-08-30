const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();

const PORT = process.env.PORT || 4000;

//use required middleware
app.use(
    bodyParser.json(),  
    cors(), 
    morgan('dev')
  );

//use apiRouter
app.use('/api', apiRouter);

//must be defined last
app.use(errorHandler());

app.listen(PORT, function () {
    console.log(`CORS-enabled web server listening on port ${PORT}`)
  });

module.exports = app;

/**
 * Create and export your Express app from a root-level file called server.js
 * Accept and set an optional port argument for your server to listen on from process.env.PORT
 * 
 * If process.env.PORT is not set, server should run on port 4000 
 * (this is where the provided front-end will make requests to)
 * 
 * Accept and set an optional database file argument from process.env.TEST_DATABASE in 
 * all Express route files that open and modify your database
 * 
 * Use the root-level database.sqlite as your API’s database 
 * Note: When loading database.sqlite in your JavaScript files, sqlite3 will always try to 
    * load database.sqlite from the root directory path, ./database.sqlite, regardless of 
    * where the current file is located. Therefore your code will always be 
    * new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite') 
    * regardless of the file you are writing in
 */