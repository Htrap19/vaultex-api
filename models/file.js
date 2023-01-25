const mongoose = require("mongoose");
const Joi = require("joi");

// Currently it supports only images
const fileSchema = new mongoose.Schema({
    storageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Storage',
        required: true
    },
    name: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    size: { // Size in bytes
        type: Number,
        required: true,
        min: 0,
        max: 192 * 1e+6 // Initially base64 can handle only 192 MB
    },
    // TODO: Type can be enum for all the supported file types(png, jpeg, txt, etc...)
    type: {
        type: String,
        required: true
    },
    // Base64 strings for images, else raw txt data
    data: {
        type: String
    },
    shareWith: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Storage'
    }
});

fileSchema.methods.getFileSizeInGB = function() {
    return this.size / 1e+9;
}

const File = mongoose.model('File', fileSchema);

function validateFile(req) {
    const schema = Joi.object({
        name: Joi.string().min(1).max(255).required(),
        size: Joi.number().min(0).max((192 * 1e+6)).required(),
        type: Joi.string().required(),
        data: Joi.string(),
        shareWith: Joi.array().items(Joi.objectId())
    });

    return schema.validate(req);
}

module.exports.File = File;
module.exports.validate = validateFile;