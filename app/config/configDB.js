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

const con = mysql.createConnection(dbParams);

con.connect((err) => {
    if (err) throw err;
    console.log("Connected to mysql database!");
});

export default con;