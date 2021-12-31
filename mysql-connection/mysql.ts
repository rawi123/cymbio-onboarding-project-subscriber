import mysql from "mysql"

const db=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'pass',
    port:33061,
    database : 'ETP',
});

export default db;
