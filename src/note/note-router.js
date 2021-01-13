const path = require('path');
const express = require('express');
const xss = require('xss');
const NoteService = require('./note-service');
const noteRouter = express.Router();
const jsonBodyParser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name)
});

noteRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NoteService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes);
            })
            .catch(next);
    });

module.exports = noteRouter;