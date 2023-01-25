const mongoose = require('mongoose');
const winston = require("winston");

module.exports = (task) => {
    return new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async (session) => {
                await task(session);
            });
            resolve();
        }
        catch (ex) {
            winston.error(ex.message);
            reject(ex);
        }
        finally {
            await session.endSession();
        }
    });
}