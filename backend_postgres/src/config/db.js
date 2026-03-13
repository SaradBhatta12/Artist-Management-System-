import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT_DB,
});

db.connect()
  .then(client => {
    console.log("✅ PostgreSQL Connected Successfully");

    client.release();
  })
  .catch(err => {
    console.error("❌ PostgreSQL Connection Failed", err.message);
  });

export default db;