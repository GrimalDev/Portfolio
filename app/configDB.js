const mysql = require('mysql');

const dbParams = {
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
};

const con = mysql.createConnection(dbParams);

con.connect((err) => {
    if (err) throw err;
    console.log("Connected to mysql database!");
});

module.exports = { con };