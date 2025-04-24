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
  queueLimit: 0,
  // Add connection retry settings
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development'
});

// Get a Promise wrapper for the pool
const promisePool = pool.promise();

// Log connection status
function testConnection() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error connecting to MySQL:', err);
      
      // Log helpful error messages depending on error type
      if (err.code === 'ECONNREFUSED') {
        console.error('Connection refused. Check that MySQL server is running and accessible.');
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Access denied. Check your MySQL username and password.');
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        console.error('Database does not exist. Make sure the database "MatchbookDB" is created.');
        console.error('You may need to run the SQL dump file: mysql < matchbook_dump.sql');
      }
      
      // Retry connection after a delay in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Will retry connection in 5 seconds...');
        setTimeout(testConnection, 5000);
      }
      
      return;
    }
    
    console.log('✅ Successfully connected to MySQL database!');
    console.log(`Connected to database: ${connection.config.database}`);
    
    // Release connection when done
    connection.release();
  });
}

// Initial connection test
testConnection();

// Set up a periodic health check in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    pool.query('SELECT 1', (err) => {
      if (err) {
        console.error('MySQL health check failed:', err);
        testConnection();
      }
    });
  }, 60000); // Check every minute
}

module.exports = {
  pool,
  promisePool,
  testConnection
};
