const {validateParamId, validateParam} = require('../middleware/validateParam');
const _ = require('lodash');
const {Storage} = require("../models/storage");
const {Router} = require('express');
const {File, validate} = require("../models/file");
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

module.exports = router;