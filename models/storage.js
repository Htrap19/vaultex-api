const mongoose = require('mongoose');
const Joi = require('joi');

const storageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // unique: false // TODO: Discuss about multiple storage for a single user
    },
    capacity: { // Capacity in Gigabytes
        type: Number,
        default: 12
    },
    size: { // Available space
        type: Number,
        default: 0,
        min: 0
    },
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    }]
});

const Storage = mongoose.model('Storage', storageSchema);

function validateStorage(storage) {
    const scheme = Joi.object({
        userId: Joi.objectId().required(),
        capacity: Joi.number().min(12),
        size: Joi.number().min(0),
        files: Joi.array().items(Joi.objectId())
    });

    return scheme.validate(storage);
}

module.exports.Storage = Storage;
module.exports.validate = validateStorage;