const transaction = require('../utils/transaction');
const populateFile = require('../middleware/populateFile');
const populateStorage = require('../middleware/populateStorage');
const auth = require('../middleware/auth');
const {validateParamId, validateParam} = require('../middleware/validateParam');
const {File, validate} = require("../models/file");
const {Storage} = require("../models/storage");
const _ = require("lodash");
const {Router} = require('express');
const router = Router();

router.get('/:id', validateParamId, async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file)
        return res.status(404).json("File not found!");

    res.json(file);
});

router.post('/', [auth, populateStorage], async (req, res) => {
    const {error} = validate(req.body);
    if (error)
        return res.status(400).json(error.details[0].message);

    const storageId = req.user.storageId;
    const {storage} = req;

    const fileData = _.pick(req.body, ['name', 'size', 'type', 'data']);

    const file = new File(fileData);

    const fileSizeInGB = file.getFileSizeInGB();
    if (storage.capacity < fileSizeInGB + storage.size)
        return res.status(400).json("Not enough space!");

    file.storageId = storageId;

    try {
        await transaction(async (session) => {
            // TODO: Refactor the duplicated code
            // const result = await Storage.findByIdAndUpdate(storageId, {
            //     $addToSet: { files: file._id },
            //     $inc: { size: fileSizeInGB }
            // });
            // if (!result)
            //     return res.status(404).json("Storage not found!");

            await file.save({session});
            storage.addFile(file);
            await storage.save({session});

            res.json(file);
        });
    } catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

router.delete('/:id', [auth, validateParamId], async (req, res) => {
    const {id} = req.params;

    const storageId = req.user.storageId;
    const storage = await Storage.findById(storageId);
    if (!storage)
        return res.status(404).json("Storage not found!");

    const file = await File.findById(id);
    if (!file)
        return res.status(404).json("File not found!");

    try {
        await transaction(async (session) => {
            await file.remove({session});
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
    }, { new: true })
        // .populate('files', '-data -storageId')
        .populate({
            path: 'files',
            select: '-data -storageId',
            populate: {
                path: 'shareWith',
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
                path: 'shareWith',
                model: 'Storage',
                select: 'userId',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name phoneNumber'
                }
            }
        });

    res.json(_.omit({...req.file._doc}, ['data']));
});

router.delete('/fav/:id', [auth, validateParamId, populateStorage, populateFile], async (req, res) => {
    await Storage.findByIdAndUpdate(req.user.storageId, {
        $pull: {
            favorites: req.params.id
        }
    }, { new: true });

    res.json(_.omit({...req.file._doc}, ['data']));
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
                    shareWith: remoteStorageId
                }
            }, { new: true, session });
            const updatedRemoteStorage = await Storage.findByIdAndUpdate(remoteStorageId, {
                $addToSet: {
                    sharedWithMe: id
                }
            }, { new: true, session }).populate('userId');

            const responseData = {
                ..._.pick(file, Object.keys(file._doc).filter(key => key !== "shareWith")),
                sharedWith: _.pick(updatedRemoteStorage.userId, ['name', 'phoneNumber'])
            };
            res.json(responseData);
        });
    } catch (ex) {
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;