const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/book');

const MONGO_DB_CONNECTION_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@library-management.8qpqy.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());

app.use('/book', bookRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message });
});

mongoose.connect(MONGO_DB_CONNECTION_URI)
  .then(result => {
    app.listen(process.env.PORT || 4000);
    console.log('connected');
  })
  .catch(err => {
    console.log(err);
  })
