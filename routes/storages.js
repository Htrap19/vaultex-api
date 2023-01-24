const auth = require('../middleware/auth');
const _ = require('lodash');
const {Storage} = require("../models/storage");
const {Router} = require('express');
const router = Router();

router.get('/', auth, async (req, res) => {
    const storage = await Storage.findById(req.user.storageId);
    res.json(storage);
});

module.exports = router;