export default {
  env_type: "development",
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  server: {
    transport: process.env.TRANSPORT || "http",
    port: process.env.SERVER_PORT,
  },
};