const mongoose = require("mongoose");
const winston = require("winston");

module.exports = function() {
    mongoose.connect('mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/vaultex?replicaSet=rs')
        .then(() => { winston.info('Connected to MongoDB'); })
        .catch(err => { winston.error(err); });
}