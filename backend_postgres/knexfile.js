import dotenv from "dotenv";
dotenv.config();
export default {
  development: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DATABASE,
      password: process.env.PASSWORD,
      port: process.env.PORT_DB,
    },
    migrations: {
      directory: "./src/migrations"
    }
  }
}