import 'dotenv/config';
import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    out: './migrations',
    schema: './src/config/database/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        port: Number(process.env.DB_PORT!),
        ssl: false,
    },
});