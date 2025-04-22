// db.js
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool instead of a single connection for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'MatchbookDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a Promise wrapper for the pool
const promisePool = pool.promise();

// Log connection status
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL database!');
  connection.release(); // Release connection when done
});

module.exports = {
  pool,
  promisePool
};
