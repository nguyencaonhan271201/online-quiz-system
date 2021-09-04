const mysql = require('mysql');

const conn = mysql.createPool({
    host: 'remotemysql.com',
    user: 'WSPIdrQDfo',
    password: 'm2zWYqHv4V',
    database: 'WSPIdrQDfo',
});

module.exports = conn;