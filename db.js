import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: 'metro.proxy.rlwy.net',
    port: 19161,
    database: 'railway',
    user: 'root',
    password: process.env.XRGPlBKksfjyBHvwldZGsZHtlOLTUmgU

})

export default pool