// Use SQLite if USE_SQLITE is set, otherwise use MySQL
if (process.env.USE_SQLITE === 'true') {
  module.exports = require('./database-sqlite');
} else {
  const mysql = require('mysql2/promise');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'india_college_finder',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  const pool = mysql.createPool(dbConfig);

  // Test connection
  const testConnection = async () => {
    try {
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      connection.release();
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
  };

  testConnection();

  module.exports = pool;
}