import mysql, {type PoolConfig} from 'mysql';
import dotenv from 'dotenv'

dotenv.config();

//When in production use "madiadb" as database host
process.env['NODE_ENV'] === 'production' ? process.env['DB_HOST'] = 'mariadb' : process.env['DB_HOST'] = 'srv.grimaldev.local';

// Database configuration from environnement variables.
const dbParams : PoolConfig = {
  host: process.env['DB_HOST'],
  user: process.env['DB_USER'],
  password: process.env['DB_PASS'],
  database: process.env['DB_NAME'],
  port: parseInt(process.env['DB_PORT'] || '3306'),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Verify if all environnement variables are set.

const poolDB = mysql.createPool(dbParams);

poolDB.query('SELECT 1 + 1 AS solution', (error, _results, _fields) => {
  if (error) throw error;
  console.log('Database connection established');
});

export default poolDB;