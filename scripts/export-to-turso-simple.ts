// This script exports the local SQLite database to Turso
// Run it with: npx ts-node scripts/export-to-turso-simple.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Exporting database to Turso...');

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
    console.log(`Importing to Turso database: speakerscircle...`);
    
    // Create a temporary script to run the command
    const tempScriptPath = path.resolve(process.cwd(), 'prisma/export-script.sh');
    const scriptContent = `#!/bin/bash

# Export the database to Turso
turso db shell speakerscircle < ${tempSqlPath}`;
    
    fs.writeFileSync(tempScriptPath, scriptContent);
    fs.chmodSync(tempScriptPath, '755');
    
    try {
      execSync(tempScriptPath, { stdio: 'inherit' });
    } finally {
      // Clean up the temporary script
      if (fs.existsSync(tempScriptPath)) {
        fs.unlinkSync(tempScriptPath);
      }
    }
    
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
