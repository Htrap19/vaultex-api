const winston = require('winston');
const express = require('express');

const app = express();

require('./startup/logging')();
require('./startup/auth')();
require('./startup/validation')();
require('./startup/db')();
require('./startup/routes')(app);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { winston.info(`Listening on port ${PORT}`); });
module.exports = server;