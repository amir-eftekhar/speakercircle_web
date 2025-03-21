# Deployment Guide for SpeakersCircle

This guide provides instructions for deploying the SpeakersCircle application to Vercel.

## Prerequisites

- Node.js and npm installed
- Git installed and configured
- Vercel account and CLI installed (optional)
- Access to the SpeakersCircle repository

## Deployment Scripts

We've created several scripts to simplify the deployment process:

### 1. Reset Database

Clears all data from the database except for admin users:

```bash
npm run reset-db
```

### 2. Seed Database

Populates the database with initial data:

```bash
npm run seed
```

### 3. Build for Vercel

Resets the database, seeds it with initial data, and builds the project:

```bash
npm run build-for-vercel
```

### 4. Deploy to Vercel

Builds the project and deploys it to Vercel:

```bash
npm run deploy "Your commit message"
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

1. Reset and seed the database:
   ```bash
   npm run reset-db
   npm run seed
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Commit your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

4. Vercel will automatically deploy the application when changes are pushed to the main branch.

## Troubleshooting

- If you encounter database errors, try running `npm run reset-db` followed by `npm run seed`.
- If the build fails, check the error logs and fix any issues before attempting to deploy again.
- If the deployment fails, check your Vercel dashboard for error details.

## Environment Variables

Ensure the following environment variables are set in your Vercel project:

- `DATABASE_URL`: URL for your database
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `NEXTAUTH_URL`: URL for NextAuth
- `ADMIN_EMAIL`: Email for the admin user
- `ADMIN_PASSWORD`: Password for the admin user
- `ADMIN_NAME`: Name for the admin user
- `STRIPE_SECRET_KEY`: Secret key for Stripe (if using Stripe)
- `STRIPE_WEBHOOK_SECRET`: Webhook secret for Stripe (if using Stripe)
- `STRIPE_PUBLIC_KEY`: Public key for Stripe (if using Stripe)

## Contact

If you encounter any issues with deployment, please contact the development team.
