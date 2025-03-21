#!/bin/bash

# Set environment variables for Turso
export TURSO_DATABASE_URL="https://speakerscircle-trivalleytechnology.turso.io"
export TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDI1NjQ2NjMsImlhdCI6MTc0MjU2MTA2MywiaWQiOiI5MzQzYTkzYi05MjRiLTQyOGMtOGE5ZC05YWNhZjM3YmRiMjkiLCJyaWQiOiJmYTUxNWEzYS05ZTI4LTQxODAtOWIyYi1jODljMWQ1YTlkN2YifQ.SvRurctyExR1w8_rM_nmNTVWQvHq4Q_l7T-0XQ2-xvst45k1P1k3nGklsYO61px8qADQ381iHBuXlwHy8LvzBg"

# Create a modified version of the export script
cat > ./scripts/export-to-turso-temp.ts << EOL
// This is a temporary script to export the local SQLite database to Turso
// with the correct database name

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
    console.error(\`SQLite database not found at \${dbPath}\`);
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
      sqlContent += \`\${table.sql};\n\n\`;
    }
    
    // Export data for each table
    console.log('Exporting data...');
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`;
    
    for (const tableObj of tables as any[]) {
      const tableName = tableObj.name;
      console.log(\`Exporting data from table: \${tableName}\`);
      
      // Get all rows from the table
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`) as Record<string, any>[];
      
      // Skip empty tables
      if (rows.length === 0) continue;
      
      // Generate INSERT statements
      for (const row of rows) {
        const columns = Object.keys(row).join('", "');
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : 
          typeof v === 'string' ? \`'\${v.replace(/'/g, "''")}'\` : 
          v instanceof Date ? \`'\${v.toISOString()}'\` : 
          v
        ).join(', ');
        
        sqlContent += \`INSERT INTO "\${tableName}" ("\${columns}") VALUES (\${values});\n\`;
      }
      
      sqlContent += '\n';
    }
    
    // Write the SQL file
    fs.writeFileSync(tempSqlPath, sqlContent);
    console.log(\`SQL export written to \${tempSqlPath}\`);
    
    // Import the SQL file to Turso
    console.log(\`Importing to Turso database: speakerscircle...\`);
    
    // Create a temporary script to run the command
    const tempScriptPath = path.resolve(process.cwd(), 'prisma/export-script.sh');
    const scriptContent = \`#!/bin/bash\n\n# Export the database to Turso\nturso db shell speakerscircle < \${tempSqlPath}\`;
    
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
EOL

# Run the temporary export script
npx ts-node --compiler-options '{"module":"CommonJS"}' ./scripts/export-to-turso-temp.ts
