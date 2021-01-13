const path = require('path');
const express = require('express');
const xss = require('xss');
const NoteService = require('./note-service');
const noteRouter = express.Router();
const jsonBodyParser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    content: xss(note.content),
    assigned_folder: note.assigned_folder
});

noteRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NoteService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote));
            })
            .catch(next);
    });

noteRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NoteService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: 'Note does not exist' }
                    });
                }
                res.note = note;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note));
    })

module.exports = noteRouter;