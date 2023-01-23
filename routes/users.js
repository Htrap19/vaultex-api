const validateParamId = require('../middleware/validateParamId');
const {User, validate} = require("../models/user");
const {Storage} = require("../models/storage");
const {Router} = require('express');
const router = Router();

// TODO: Only admin can access this endpoint
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const {name, phoneNumber} = req.body;

    let user = await User.findOne({ phoneNumber });
    if (user)
        return res.status(400).json("User already registered!");

    user = new User({name, phoneNumber});

    const storage = new Storage({ userId: user._id });
    user.storageId = storage._id;

    // TODO: Implement transactions or two phase commits
    await user.save();
    await storage.save();

    res.json(user);
});

// TODO: After JWT token implementation it should replaced with '/me' endpoint
router.get('/:id', validateParamId, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user)
        return res.status(404).json("User not found!");

    res.json(user);
});

module.exports = router;