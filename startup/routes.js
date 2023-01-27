const express = require("express");
const cors = require('cors');
const auth = require('../routes/auth');
const users = require("../routes/users");
const storages = require("../routes/storages");
const files = require("../routes/files");

module.exports = function(app) {
    app.use(cors());
    app.use(express.json({limit: '50mb'}));
    app.use('/api/auth', auth);
    app.use('/api/users', users);
    app.use('/api/storages', storages);
    app.use('/api/files', files);
}