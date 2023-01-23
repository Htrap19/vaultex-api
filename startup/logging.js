const winston = require("winston");

module.exports = function() {
    winston.add(new winston.transports.Console({ format: winston.format.cli() }));
    winston.add(new winston.transports.File({ filename: 'error.log' }))
}