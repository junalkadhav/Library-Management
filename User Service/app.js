const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');

const app = express();

app.use(bodyParser.json());

app.use('/user', userRoutes);

app.listen(process.env.PORT || 3000);