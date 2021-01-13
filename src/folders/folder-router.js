const path = require('path');
const express = require('express');
const xss = require('xss');
const FolderService = require('./folder-service');

const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
    name: xss(folder.name)
});

folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
    });