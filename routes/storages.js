const auth = require('../middleware/auth');
const _ = require('lodash');
const {Storage} = require("../models/storage");
const {Router} = require('express');
const router = Router();

router.get('/', auth, async (req, res) => {
    const storage = await Storage
        .findById(req.user.storageId)
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
        // .populate('favorites', '-data -storageId')
        // .populate('sharedWithMe', '-data -shareWith')
        .populate({
            path: 'sharedWithMe',
            select: '-data -shareWith',
            populate: {
                path: 'storageId',
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