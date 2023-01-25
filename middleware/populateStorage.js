const {Storage} = require('../models/storage');

module.exports = async function(req, res, next) {
    const storage = await Storage.findById(req.user.storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    req.storage = storage;
    next();
}