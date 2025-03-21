#!/bin/bash

# Exit on error
set -e

echo "🔄 Starting build process for Vercel deployment..."

# Step 1: Reset the database
echo "🗑️  Resetting database..."
npm run reset-db

# Step 2: Seed the database with initial data
echo "🌱 Seeding database with initial data..."
npm run seed

# Step 3: Build the project
echo "🏗️  Building the project..."
npm run build

echo "✅ Build completed successfully!"
echo "The project is now ready to be deployed to Vercel."
echo "You can now commit and push your changes to deploy to Vercel."
