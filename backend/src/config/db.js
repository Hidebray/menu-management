const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DB_HOST) {
  console.error("FATAL ERROR: DB_HOST is not defined.");
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;