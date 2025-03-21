// This script exports the local SQLite database to Turso
// Run it with: npx ts-node scripts/export-to-turso.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Exporting database to Turso...');

  // Check if Turso CLI is installed
  try {
    execSync('turso --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Turso CLI is not installed. Please install it first:');
    console.error('curl -sSfL https://get.tur.so/install.sh | bash');
    process.exit(1);
  }

  // Check if TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in the environment');
    console.error('You can create a Turso database and get these values by running:');
    console.error('turso db create speakerscircle');
    console.error('turso db tokens create speakerscircle');
    process.exit(1);
  }

  // Extract database name from URL
  const dbName = tursoUrl.split('/').pop();
  if (!dbName) {
    console.error('Could not extract database name from TURSO_DATABASE_URL');
    process.exit(1);
  }

  // Path to the SQLite database
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  if (!fs.existsSync(dbPath)) {
    console.error(`SQLite database not found at ${dbPath}`);
    process.exit(1);
  }

  try {
    // Export the SQLite database schema
    console.log('Exporting schema...');
    const schema = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`;
    
    // Create a temporary SQL file
    const tempSqlPath = path.resolve(process.cwd(), 'prisma/export.sql');
    let sqlContent = '';
    
    // Add schema creation statements
    for (const table of schema as any[]) {
      sqlContent += `${table.sql};\n\n`;
    }
    
    // Export data for each table
    console.log('Exporting data...');
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`;
    
    for (const tableObj of tables as any[]) {
      const tableName = tableObj.name;
      console.log(`Exporting data from table: ${tableName}`);
      
      // Get all rows from the table
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`) as Record<string, any>[];
      
      // Skip empty tables
      if (rows.length === 0) continue;
      
      // Generate INSERT statements
      for (const row of rows) {
        const columns = Object.keys(row).join('", "');
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : 
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : 
          v instanceof Date ? `'${v.toISOString()}'` : 
          v
        ).join(', ');
        
        sqlContent += `INSERT INTO "${tableName}" ("${columns}") VALUES (${values});\n`;
      }
      
      sqlContent += '\n';
    }
    
    // Write the SQL file
    fs.writeFileSync(tempSqlPath, sqlContent);
    console.log(`SQL export written to ${tempSqlPath}`);
    
    // Import the SQL file to Turso
    console.log(`Importing to Turso database: ${dbName}...`);
    execSync(`turso db shell ${dbName} < ${tempSqlPath}`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        TURSO_API_TOKEN: tursoToken
      }
    });
    
    console.log('Database successfully exported to Turso!');
    
    // Clean up
    fs.unlinkSync(tempSqlPath);
    
  } catch (error) {
    console.error('Error exporting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
