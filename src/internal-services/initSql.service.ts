import { Sequelize } from "sequelize";
import environments from "../environments";
const global: any = globalThis;
async function initializeDatabase() {
    const connectionString = `postgres://${environments.database.username}:${environments.database.password}@${environments.database.host}:${environments.database.port}/${environments.database.database}`;
    console.warn("Database connection string:", connectionString);
    global.connection = new Sequelize(connectionString);
    try {
        await global.connection.authenticate();
        console.warn("Database connection established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

export default initializeDatabase;
