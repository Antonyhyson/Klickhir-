// D:\Project\ClickHire\setup-db.mjs
import { sql } from './lib/db.js'; // Note the .js extension for direct import
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    const __dirname = path.dirname(new URL(import.meta.url).pathname);

    // Read and execute the SQL files in order
    const sqlFiles = [
      'scripts/001-create-tables.sql',
      'scripts/002-seed-data.sql',
      'scripts/003-messaging-tables.sql'
    ];

    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`);
      const sqlContent = fs.readFileSync(path.join(__dirname, file), 'utf8');

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