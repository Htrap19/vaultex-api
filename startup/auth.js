const config = require("config");
const winston = require("winston");

module.exports = function() {
    if (!config.get('jwtPrivateKey')) {
        winston.error("FATAL ERROR: jwtPrivateKey not defined.");
        process.exit(1);
    }
}