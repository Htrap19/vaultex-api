const transaction = require('../utils/transaction');
const populateFile = require('../middleware/populateFile');
const populateStorage = require('../middleware/populateStorage');
const auth = require('../middleware/auth');
const multer = require('multer');
const {validateParamId, validateParam} = require('../middleware/validateParam');
const {File} = require("../models/file");
const {Storage} = require("../models/storage");
const _ = require("lodash");
const {Router} = require('express');
const path = require("path");
const winston = require("winston");
const fs = require("fs");
const router = Router();
const upload = multer({ dest: path.join(__dirname, '../temp-files') });

router.get('/download/:id', [auth, validateParamId], async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file)
        return res.status(404).json("File not found!");

    res.attachment(file.filename);
    file.downloadStream(res);
});

router.get('/:id', [auth, validateParamId], async (req, res) => {
    const file = await File.findById(req.params.id)
        .populate({
            path: 'metadata.storageId',
            model: 'Storage',
            select: 'userId',
            populate: {
                path: 'userId',
                model: 'User',
                select: 'name phoneNumber'
            }
        })
        .populate({
            path: 'metadata.shareWith',
            model: 'Storage',
            select: 'userId',
            populate: {
                path: 'userId',
                model: 'User',
                select: 'name phoneNumber'
            }
        });

    if (!file)
        return res.status(404).json("File not found!");

    res.json(file);
});

router.post('/', [auth, populateStorage, upload.any()], async (req, res) => {
    if (!req.files || req.files.length <= 0)
        return res.status(400).json("Nothing to upload!");

    const storageId = req.user.storageId;
    const {storage} = req;

    const totalSizeInGB = req.files.reduce((accumulator, file) => accumulator + File.getFileSizeInGB(file), 0);

    // Check for available free space in the storage
    if (storage.capacity < (totalSizeInGB + storage.size))
        return res.status(400).json("Not enough space!");

    const uploadedFiles = [];
    const promises = req.files.map(async file => {
        const readStream = fs.createReadStream(file.path);

        try {
            await transaction(async (session) => {
                const gridFile = new File({ filename: file.originalname });
                const fileSizeInGB = File.getFileSizeInGB(file);
                gridFile.setMetadata(storageId);

                const updatedFile = await gridFile.upload(readStream);

                await Storage.findByIdAndUpdate(storageId, {
                    $addToSet: { files: gridFile._id },
                    $inc: { size: fileSizeInGB },
                }, {session});

                uploadedFiles.push(updatedFile);
            });
        } catch (ex) {
            // TODO: Implement error handling logic
            winston.error(ex);
        } finally {
            fs.unlinkSync(file.path);
        }
    });
    await Promise.all(promises);

    res.json(uploadedFiles);
});

router.delete('/:id', [auth, validateParamId, populateStorage, populateFile], async (req, res) => {
    const {id} = req.params;

    const {storage} = req;

    try {
        await transaction(async (session) => {
            const file = await File.findByIdAndDelete(id, { new: true, session});
            storage.removeFile(file);
            await storage.save({session});

            res.json(file);
        });
    } catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

router.post('/fav/:id', [auth, validateParamId, populateStorage, populateFile], async (req, res) => {
    await Storage.findByIdAndUpdate(req.user.storageId, {
        $addToSet: {
            favorites: req.params.id
        }
    }).populate({
            path: 'files',
            select: '-data -storageId',
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
        })
        .populate({
            path: 'favorites',
            select: '-data -storageId',
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
        });

    res.json(req.file);
});

router.delete('/fav/:id', [auth, validateParamId, populateStorage, populateFile], async (req, res) => {
    await Storage.findByIdAndUpdate(req.user.storageId, {
        $pull: {
            favorites: req.params.id
        }
    });

    res.json(req.file);
});

router.post('/share_with/:remoteStorageId/:id',
    [auth, validateParam('remoteStorageId'), validateParamId, populateStorage],
    async (req, res) => {
    const {remoteStorageId, id} = req.params;
    const {storage} = req;

    if (!storage.files.some(f => f._id.toHexString() === id))
        return res.status(404).json("File not found!");

    if (req.user.storageId === remoteStorageId)
        return res.status(404).json("Cannot share a file to the same storage!");

    const remoteStorage = Storage.findById(remoteStorageId);
    if (!remoteStorage)
        return res.status(404).json("Remote storage not found!");

    try {
        await transaction(async (session) => {
            const file = await File.findByIdAndUpdate(id, {
                $addToSet: {
                    "metadata.shareWith": remoteStorageId
                }
            }, { new: true, session });
            const updatedRemoteStorage = await Storage.findByIdAndUpdate(remoteStorageId, {
                $addToSet: {
                    sharedWithMe: id
                }
            }, { new: true, session }).populate('userId');

            const responseData = {
                ..._.pick(file, Object.keys(file._doc).filter(key => key !== "metadata")),
                sharedWith: _.pick(updatedRemoteStorage.userId, ['name', 'phoneNumber'])
            };
            res.json(responseData);
        });
    } catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;