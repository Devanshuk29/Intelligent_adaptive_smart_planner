const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'Devansh@29_',
  host: 'localhost',
  port: 5432,
  database: 'goal_planner'
});

module.exports = pool;