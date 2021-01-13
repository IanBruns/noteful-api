const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeNotesArray } = require('./notes.fixtures');
const { makeFoldersArray } = require('./folders.fixtures');

describe('Folder Endpoints', () => {
    let db;

    before('Make the knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after('disconnect from the database', () => db.destroy());

    before('clean the notes table', () => db('notes').truncate());
    before('clean the folders table', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'));

    afterEach('cleanup notes', () => db('notes').truncate());
    afterEach('cleanup folders', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'));

    describe('GET /api/notes', () => {
        context('given no notes in the folders', () => {
            it('returns a 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, []);
            });
        });

        context('given notes in folders', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach('Add Folders', () => {
                return db.into('folders')
                    .insert(testFolders);
            });

            beforeEach('add notes', () => {
                return db.into('notes')
                    .insert(testNotes);
            });

            it('returns a 200 and all notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes);
            });
        });
    });

    describe.only('GET api/notes/:note_id', () => {
        context('when there are no notes in the database', () => {
            it('returns a 404 and an error for the note', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/notes/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Note does not exist' }
                    });
            });
        });
    });
});