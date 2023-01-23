const validateParamId = require('../middleware/validateParamId');
const _ = require('lodash');
const {Storage} = require("../models/storage");
const {Router} = require('express');
const {File, validate} = require("../models/file");
const mongoose = require("mongoose");
const router = Router();

// TODO: Admin only route
router.get('/', async (req, res) => {
    const storages = await Storage.find();
    res.json(storages);
});

router.get('/:id', validateParamId, async (req, res) => {
    const storageId = req.params.id;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    res.json(storage);
});

// Upload file
router.post('/file/:id', validateParamId, async (req, res) => {
    const {error} = validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);

    const storageId = req.params.id;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const fileData = _.pick(req.body, ['name', 'size', 'type', 'data']);

    const file = new File(fileData);
    file.storageId = storageId;

    await file.save();
    storage.files.push(file);

    await storage.save();

    res.json(storage);
});

// Delete file
router.delete('/file/:id/:fileId', validateParamId, async (req, res) => {
    // TODO: Let the validateParamId middleware handle the object id validations
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId))
        return res.status(400).json("Invalid file Id!");

    const storageId = req.params.id;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const fileId = req.params.fileId;
    const file = await File.findById(fileId);
    if (!file)
        return res.status(404).json("File not found with given Id!");
    await file.remove();
    storage.files = storage.files.filter(f => f._id !== file._id);

    await storage.save();
});

// TODO: Create endpoint for folders

module.exports = router;