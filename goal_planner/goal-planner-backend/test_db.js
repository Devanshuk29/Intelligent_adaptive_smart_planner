const pool = require('./config/database');

pool.query('SELECT * FROM users', (err, res) => {
  if (err) {
    console.error('❌ Connection FAILED:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to database!');
    console.log('Users table is currently empty:', res.rows);
    process.exit(0);
  }
});