const transaction = require('../utils/transaction');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
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

    const {name, phoneNumber, password} = req.body;

    let user = await User.findOne({ phoneNumber });
    if (user)
        return res.status(400).json("User already registered!");

    user = new User({name, phoneNumber});
    user.password = await bcrypt.hash(password, 10);

    const storage = new Storage({ userId: user._id });
    user.storageId = storage._id;

    try {
        await transaction(async (session) => {
            await user.save({ session });
            await storage.save({ session });

            const token = user.generateToken();
            res.header('x-auth-token', token).json(_.pick(user, ['_id', 'name', 'storageId']));
        });
    }
    catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(user);
});

module.exports = router;