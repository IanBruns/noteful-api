const { expect } = require('chai');
const knex = require('knex');
const { compile } = require('morgan');
const supertest = require('supertest');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousImgFolder } = require('./folders.fixtures');

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

    describe('/GET /api/folders', () => {
        context('given no folders in the database', () => {
            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, []);
            });
        });

        context('given folders in the database', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db.into('folders')
                    .insert(testFolders);
            });

            it('returns with a 200 and the array of folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders);
            });
        });
    });

    describe('GET /api/folders/:folder_id', () => {
        context('given no folders in the database', () => {
            it('retuns a 404 and an error for the folder', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/folders/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Folder does not exist' }
                    });
            });
        });

        context('given folders in the database', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db.into('folders')
                    .insert(testFolders);
            });

            it('returns a 200 and the expected folder', () => {
                const testId = 2;
                const expectedFolder = testFolders[testId - 1];

                return supertest(app)
                    .get(`/api/folders/${testId}`)
                    .expect(200, expectedFolder);
            });
        });
    });

    describe('POST /api/folders', () => {
        it('creates a folder responding with a 201 then the new folder', () => {
            const newFolder = { folder_name: 'New Folder' };

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name);
                    expect(res.body).to.have.property('id');
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/api/folders/${postRes.body.id}`)
                        .expect(postRes.body);
                });
        });

        it('rejectes a folder with no name, sending a 400 and error', () => {
            const emptyFolder = { folder_name: '' };

            return supertest(app)
                .post('/api/folders')
                .send(emptyFolder)
                .expect(400)
                .expect({
                    error: { message: `Missing folder name` }
                });
        });

        it('Sanitizes an xss attack', () => {
            const { maliciousImgFolder, expectedImgFolder } = makeMaliciousImgFolder();

            return supertest(app)
                .post('/api/folders')
                .send(maliciousImgFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(expectedImgFolder.folder_name);
                });
        });
    });

    describe.only('DELETE /api/folders/:folder_id'){
        context('When the database is empty', () => {
            it('Returns a 400 and an error', () => {
                context('given no folders in the database', () => {
                    it('retuns a 404 and an error for the folder', () => {
                        const testId = 1612;

                        return supertest(app)
                            .delete(`/api/folders/${testId}`)
                            .expect(404)
                            .expect({
                                error: { message: 'Folder does not exist' }
                            });
                    });
                });
            })
        })
    }
});