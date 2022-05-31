const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

//initialize mongo database connection string
const MONGO_DB_CONNECTION_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@library-management.8qpqy.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

//parses every incoming request
app.use(bodyParser.json());

//routes for incoming requests
app.use('/user', userRoutes);
app.use('/user', authRoutes);

//handle invalid url requests
app.use((req, res, next) => res.status(404).json({ message: 'Invalid Url' }));

//common middleware to handle error thrown by controllers
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

//connecting with database
mongoose.connect(MONGO_DB_CONNECTION_URI)
  .then(result => {
    app.listen(process.env.PORT || 3000);
    console.log('connected');
  })
  .catch(err => {
    console.log(err);
  })


/**
 * console.log(error);
const status = error.statusCode || 500;
const message = error.message;
const data = error.data;
res.status(status).json({ message: message });
 */
