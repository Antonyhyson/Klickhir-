// D:\Project\ClickHire\setup-db.js
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Dynamically import the database module after the build
    const { sql } = await import('./lib/db.js');
    
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