import mysql from 'mysql';
import dotenv from 'dotenv'
dotenv.config();

//When in production use "madiadb" as database host
process.env.NODE_ENV === 'production' ? process.env.DB_HOST = 'mariadb' : process.env.DB_HOST = '192.168.100.200';

const dbParams = {
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port    : process.env.DB_PORT,
    charset: 'utf8mb4'
};

const poolDB = mysql.createPool(dbParams);

poolDB.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to mysql database!");
});

export default poolDB;