# Deploying to Vercel with Turso Database

This guide explains how to deploy the application to Vercel using Turso as a cloud database for SQLite.

## Why Turso?

Vercel's serverless functions have a read-only filesystem, which means traditional SQLite databases won't work in production. Turso is a distributed database built on libSQL (a SQLite fork) that provides:

- SQLite compatibility
- Cloud hosting
- Serverless-friendly architecture
- Global distribution for low latency

## Setup Instructions

### 1. Install Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Create a Turso Database

```bash
# Log in to Turso
turso auth login

# Create a new database
turso db create speakerscircle

# Get the database URL
turso db show speakerscircle --url

# Create an authentication token
turso db tokens create speakerscircle
```

### 3. Export Local Database to Turso

We've created a script to export your local SQLite database to Turso:

```bash
# Create a simplified export script that works directly with the Turso CLI
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/export-to-turso-simple.ts
```

This script will:
1. Extract the schema and data from your local SQLite database
2. Create SQL statements for tables and data
3. Execute those statements against your Turso database

### 4. Configure Vercel Environment Variables

In the Vercel dashboard, add the following environment variables:

- `TURSO_DATABASE_URL`: The URL of your Turso database (from `turso db show speakerscircle --url`)
  Example: `libsql://speakerscircle-trivalleytechnology.turso.io`
- `TURSO_AUTH_TOKEN`: The authentication token (from `turso db tokens create speakerscircle`)
  Example: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`
- `NEXTAUTH_SECRET`: A random string for NextAuth.js session encryption
- `NEXTAUTH_URL`: The URL of your deployed application
- `NEXT_PUBLIC_APP_URL`: The URL of your deployed application

### 5. Deploy to Vercel

```bash
npm run deploy
```

## How It Works

The application is configured to use different database strategies based on the environment:

- **Development**: Uses local SQLite database via Prisma
- **Production**: Uses Turso for database operations

The code automatically detects the environment and switches between the two modes.

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your Turso credentials in the Vercel environment variables
2. Check that your database exists and is accessible
3. Try regenerating the auth token if needed

### Missing Tables or Data

If tables or data are missing:

1. Run the export script again
2. Check the Turso database directly with `turso db shell speakerscircle`
3. Verify that the schema matches your local database

## Limitations

- Turso has some limitations compared to a full SQLite database
- Complex queries might need optimization
- The free tier has usage limits

For more information, visit the [Turso documentation](https://docs.turso.tech).
