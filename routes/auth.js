const _ = require('lodash');
const bcrypt = require('bcrypt');
const {Router} = require('express');
const Joi = require("joi");
const {User} = require("../models/user");
const router = Router();

router.post('/', async (req, res) => {
    const {error} = validateAuth(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);

    const {phoneNumber, password} = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user)
        return res.status(400).json("Invalid phone number or password!");

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
        const token = user.generateToken();
        return res.header('x-auth-token', token).json(_.pick(user, ['_id', 'name', 'storageId']));
    }

    res.status(400).json("Invalid phone number or password!");
});

function validateAuth(req) {
    const schema = Joi.object({
        phoneNumber: Joi.string().min(10).max(13).required(),
        password: Joi.string().min(8).max(255).required()
    });

    return schema.validate(req);
}

module.exports = router;