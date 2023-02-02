const auth = require('../middleware/auth');
const _ = require('lodash');
const {Storage} = require("../models/storage");
const {Router} = require('express');
const router = Router();

router.get('/', auth, async (req, res) => {
    const storage = await Storage
        .findById(req.user.storageId)
        .populate({
            path: 'files',
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
        })
        .populate({
            path: 'sharedWithMe',
            select: '-metadata.shareWith',
            populate: {
                path: 'metadata.storageId',
                model: 'Storage',
                select: 'userId',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name phoneNumber'
                }
            }
        });

    if (!storage)
        return res.status(404).json("Storage not found!");

    res.json(storage);
});

module.exports = router;