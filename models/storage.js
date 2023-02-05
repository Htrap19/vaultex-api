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
    size: { // Available space in Gigabytes
        type: Number,
        default: 0,
        min: 0
    },
    files: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'File',
    },
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'File',
    },
    sharedWithMe: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'File'
    }
});

storageSchema.methods.addFile = function(file) {
    const fileSizeInGB = file.getFileSizeInGB();
    if (this.files.some(f => f._id.toHexString() === file._id.toHexString()))
        return;

    this.size += fileSizeInGB;
    this.files.push(file);
}

storageSchema.methods.removeFile = function(file) {
    const fileSizeInGB = file.getFileSizeInGB();
    this.files = this.files.filter(f => f._id.toHexString() !== file._id.toHexString());
    this.size -= fileSizeInGB;
}

storageSchema.statics.findByIdAndPopulate = function (id) {
    const genPopulateObj = (path) => {
        return {
            path: path,
            select: '-metadata.storageId',
            model: 'File',
            populate: {
                path: 'metadata.shareWith',
                model: 'Storage',
                select: 'userId',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name phoneNumber'
                }
            }
        }
    };

    // Populate files
    return this.findById(id)
        .populate(genPopulateObj('files'))
        .populate(genPopulateObj('favorites'))
        .populate(genPopulateObj('sharedWithMe'));``
}

const Storage = mongoose.model('Storage', storageSchema);

function validateStorage(storage) {
    const scheme = Joi.object({
        userId: Joi.objectId().required(),
        capacity: Joi.number().min(12),
        size: Joi.number().min(0),
        files: Joi.array().items(Joi.objectId()),
        favorites: Joi.array().items(Joi.objectId())
    });

    return scheme.validate(storage);
}

module.exports.Storage = Storage;
module.exports.validate = validateStorage;