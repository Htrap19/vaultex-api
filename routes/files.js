const validateParamId = require('../middleware/validateParamId');
const {Router} = require('express');
const {File, validate} = require("../models/file");
const router = Router();

router.get('/:id', validateParamId, async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file)
        return res.status(404).json("File not found!");

    res.json(file);
});

module.exports = router;