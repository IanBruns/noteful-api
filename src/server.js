const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');
const pg = require('pg');

const db = knex({
    client: 'pg',
    connection: DATABASE_URL
});

pg.defaults.ssl = process.env.NODE_ENV === 'production';

app.set('db', db);

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});