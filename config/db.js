const mysql = require('mysql2');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'mysql-warner.alwaysdata.net',
  user: process.env.DB_USER || 'warner',
  password: process.env.DB_PASSWORD || 'baqueta2',
  database: process.env.DB_NAME || 'warner_tienda_lucy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(config);
const promisePool = pool.promise();

module.exports = {
  pool,
  promise: promisePool,
  getConnection: () => pool.getConnection(),
  query: (sql, params) => promisePool.query(sql, params)
}; 