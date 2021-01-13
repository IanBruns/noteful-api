const { expect } = require('chai');
const knex = require('knex');
const { compile } = require('morgan');
const supertest = require('supertest');
const app = require('../src/app');
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

    before('clean the table', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'));

    describe.only('/GET /api/folders', () => {
        context('given no folders in the database', () => {
            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, []);
            });
        });
    });
});