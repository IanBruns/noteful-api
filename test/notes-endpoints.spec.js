const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeNotesArray } = require('./notes.fixtures');

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
});