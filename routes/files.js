const {validateParamId, validateParam} = require('../middleware/validateParam');
const {File, validate} = require("../models/file");
const {Storage} = require("../models/storage");
const _ = require("lodash");
const {Router} = require('express');
const winston = require("winston");
const mongoose = require("mongoose");
const router = Router();

router.get('/:id', validateParamId, async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file)
        return res.status(404).json("File not found!");

    res.json(file);
});

router.post('/:storageId', validateParam('storageId'), async (req, res) => {
    const {error} = validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);

    const storageId = req.params.storageId;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const fileData = _.pick(req.body, ['name', 'size', 'type', 'data']);

    const file = new File(fileData);

    const fileSizeInGB = file.getFileSizeInGB();
    if (storage.capacity < fileSizeInGB + storage.size)
        return res.status(400).json("Not enough space!");

    file.storageId = storageId;

    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            await file.save();
            storage.addFile(file);
            await storage.save();

            res.json(file);
        });
        await session.endSession();
    }
    catch (ex) {
        winston.error(ex.message);
        res.status(500).json("Something went wrong!");
    }
});

router.delete('/:storageId/:fileId',
    [validateParam('storageId'), validateParam('fileId')],
    async (req, res) => {
    const { storageId, fileId } = req.params;

    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const file = await File.findById(fileId);
    if (!file)
        return res.status(400).json("File not found!");

    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            await file.remove();
            storage.removeFile(file);
            await storage.save();

            res.json(file);
        });

        await session.endSession();
    }
    catch (ex) {
        winston.error(ex.message);
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;