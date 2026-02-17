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
    port: process.env.SERVER_PORT,
  },
  mcp: {
    apiKey: process.env.MCP_API_KEY || Date.now().toString() ,
    totpSecret: process.env.TOTP_SECRET || "AAABRACADABRA", // Default secret for testing if not provided
  },
  jules: {
    apiKey: process.env.JULES_API_KEY,
    baseUrl: process.env.JULES_BASE_URL,
  },
};