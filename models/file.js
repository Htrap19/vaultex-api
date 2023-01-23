const mongoose = require("mongoose");
const Joi = require("joi");

// Currently it supports only images
const fileSchema = new mongoose.Schema({
    storageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        min: 5,
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
});

const File = mongoose.model('File', fileSchema);

function validateFile(req) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required(),
        size: Joi.number().min(0).max((192 * 1e+6)).required(),
        type: Joi.string().required(),
        data: Joi.string()
    });

    return schema.validate(req);
}

module.exports.File = File;
module.exports.validate = validateFile;