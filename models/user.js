const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        minLength: 10, // without country code or plus sign
        maxLength: 13  // with country code and plus sign
        // TODO: Discuss about formatting it internally,
        //   and in future to use Regex to validate the phone number
    },
    storageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Storage',
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.methods.generateToken = function() {
    return jwt.sign({ _id: this._id, storageId: this.storageId }, config.get('jwtPrivateKey'));
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        phoneNumber: Joi.string().min(10).max(13).required(),
        password: Joi.string().min(8).max(255).required()
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;