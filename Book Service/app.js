const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/book');

const MONGO_DB_CONNECTION_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@library-management.8qpqy.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

//parsing every incoming request
app.use(bodyParser.json());

//specifying routes incoming requests can reach
app.use('/book', bookRoutes);

//handle invalid url requests
app.use((req, res, next) => res.status(404).json({ message: 'Invalid Url' }));

//common error handler for controller functions
app.use((error, req, res, next) => {
  console.log(error);
  const err = {};
  const status = error.statusCode || 500;
  err.message = error.message;
  if (error.data) {
    err.data = error.data;
  }
  res.status(status).json(err);
});

//connecting to database
mongoose.connect(MONGO_DB_CONNECTION_URI)
  .then(result => {
    app.listen(process.env.PORT || 4000);
    console.log('connected');
  })
  .catch(err => {
    console.log(err);
  })
