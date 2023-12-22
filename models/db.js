require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err)=>{
    if(err){
        console.error('Error connecting to mysql database: ',err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;