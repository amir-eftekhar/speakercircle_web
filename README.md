This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

### Quick Deployment

To quickly deploy the application to Vercel with a single command:

```bash
npm run deploy "Your commit message"
```

This will:
1. Build the application
2. Commit changes to Git
3. Push to GitHub
4. Deploy to Vercel

### Database Management

For database management, we provide several scripts:

```bash
# Reset the database (deletes all records except admin users)
npm run reset-db

# Seed the database with initial data
npm run seed

# Export the database to Turso for Vercel deployment
npm run export-to-turso-simple
```

### Turso Database for Vercel

Since SQLite doesn't work in Vercel's serverless environment, we use Turso as a cloud-compatible SQLite database. See [TURSO_DEPLOYMENT.md](./TURSO_DEPLOYMENT.md) for detailed setup instructions.

### Environment Variables

Make sure to set these environment variables in your Vercel project:

- `NEXTAUTH_SECRET`: A random string for session encryption
- `NEXTAUTH_URL`: Your deployed app URL
- `NEXT_PUBLIC_APP_URL`: Your deployed app URL
- `TURSO_DATABASE_URL`: Your Turso database URL (format: `libsql://speakerscircle-username.turso.io`)
- `TURSO_AUTH_TOKEN`: Your Turso authentication token
- `STRIPE_SECRET_KEY`: Your Stripe secret key (optional)
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (optional)

For local development, you can set these in a `.env.local` file.
