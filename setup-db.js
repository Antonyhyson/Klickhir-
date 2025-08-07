// antonyhyson/klickhire/Klickhire-e4bc0e3dd700b8b7e4ec33875385fb3f8308bc6d/setup-db.js
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from "@neondatabase/serverless";

// Load environment variables from .env file FIRST
config();

// Re-create the database connection logic from lib/db.ts directly
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

// A helper function to replicate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Read and execute the SQL files in order
    const sqlFiles = [
      'scripts/001-create-tables.sql',
      'scripts/002-seed-data.sql',
      'scripts/003-messaging-tables.sql'
    ];

    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`);
      const sqlContent = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

      // Split by semicolon and execute each statement
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await sql.unsafe(statement);
        }
      }
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();