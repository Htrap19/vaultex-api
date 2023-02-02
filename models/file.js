const mongoose = require("mongoose");
const gridFileSchema = require('gridfile');

const GB = 1e+9;

gridFileSchema.methods.setMetadata = function(storageId, shareWith = []) {
    this.metadata = {
        storageId,
        shareWith
    };
}

gridFileSchema.methods.getFileSizeInGB = function() {
    return this.chunkSize / GB;
}

gridFileSchema.statics.getFileSizeInGB = function(fileStream) {
    return fileStream.size / GB;
}

const File = mongoose.model('File', gridFileSchema, 'file.files');

module.exports.File = File;