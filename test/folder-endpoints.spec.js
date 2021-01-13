const { expect } = require('chai');
const knex = require('knex');
const { compile } = require('morgan');
const supertest = require('supertest');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');