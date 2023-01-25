const {File} = require('../models/file');

module.exports = async function(req, res, next) {
    const fileId = req.params.id; // TODO: Think of better implementation
    const file = await File.findById(fileId);
    if (!file)
        return res.status(404).json("File not found!");

    req.file = file;
    next();
}