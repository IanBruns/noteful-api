const path = require('path');
const express = require('express');
const xss = require('xss');
const FolderService = require('./folder-service');
const folderRouter = express.Router();
const jsonBodyParser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
});

folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FolderService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { folder_name } = req.body;
        const newFolder = { folder_name };

        if (folder_name == null || folder_name.length < 1) {
            return res.status(400).json({
                error: { message: `Missing folder name` }
            });
        }

        FolderService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder));
            })
            .catch(next);
    });

folderRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FolderService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: 'Folder does not exist' }
                    });
                }
                res.folder = folder;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder));
    });

module.exports = folderRouter;