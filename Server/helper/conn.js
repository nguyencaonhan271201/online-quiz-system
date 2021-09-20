const mysql = require('mysql');

const conn = mysql.createPool({
    //Private Info
});

module.exports = conn;
