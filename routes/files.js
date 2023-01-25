const transaction = require('../utils/transaction');
const auth = require('../middleware/auth');
const {validateParamId, validateParam} = require('../middleware/validateParam');
const {File, validate} = require("../models/file");
const {Storage} = require("../models/storage");
const _ = require("lodash");
const {Router} = require('express');
const router = Router();

router.get('/:id', validateParamId, async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file)
        return res.status(404).json("File not found!");

    res.json(file);
});

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);

    const storageId = req.user.storageId;
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
        await transaction(async (session) => {
            await file.save({ session });
            storage.addFile(file);
            await storage.save({ session });

            res.json(file);
        });
    }
    catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

router.delete('/:id', [auth, validateParamId], async (req, res) => {
    const { id } = req.params;

    const storageId = req.user.storageId;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const file = await File.findById(id);
    if (!file)
        return res.status(404).json("File not found!");

    try {
        await transaction(async (session) => {
            await file.remove({ session });
            storage.removeFile(file);
            await storage.save({ session });

            res.json(file);
        });
    }
    catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;