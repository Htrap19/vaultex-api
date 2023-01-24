const mongoose = require("mongoose");
const winston = require("winston");

module.exports = function() {
    mongoose.connect('mongodb://127.0.0.1/vaultex')
        .then(() => { winston.info('Connected to MongoDB'); })
        .catch(err => { winston.error(err); });
}