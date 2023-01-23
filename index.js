const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const winston = require('winston');
const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/users');
const storages = require('./routes/storages');
const files = require('./routes/files');

const app = express();

require('./startup/logging')();

mongoose.connect('mongodb://127.0.0.1/vaultex')
    .then(() => { winston.info('Connected to MongoDB'); })
    .catch(err => { winston.error(err); });

app.use(express.json({limit: '50mb'}));
app.use('/api/users', users);
app.use('/api/storages', storages);
app.use('/api/files', files);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { winston.info(`Listening on port ${PORT}`) });
module.exports = server;