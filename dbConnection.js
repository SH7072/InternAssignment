
const Pool = require('pg').Pool;
const conString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: conString,
});

module.exports = pool;
