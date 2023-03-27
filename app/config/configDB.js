import mysql from 'mysql';
import dotenv from 'dotenv'
dotenv.config();

const dbParams = {
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port    : process.env.DB_PORT
};

const poolDB = mysql.createPool(dbParams);

poolDB.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to mysql database!");
});

export default poolDB;