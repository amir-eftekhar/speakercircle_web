#!/bin/bash

# Make sure the script is executable
# chmod +x scripts/generate-secrets.sh

echo "Generating secure keys for your application..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY: $ENCRYPTION_KEY"

# Create a template for other keys
echo "
Other keys you need to set up:

1. Stripe Keys (from https://dashboard.stripe.com/apikeys):
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (create in Stripe Dashboard > Developers > Webhooks)

2. Database URL:
DATABASE_URL=\"postgresql://username:password@localhost:5432/speakerscircle\"
(Replace username, password with your database credentials)

3. SendGrid API Key (from https://app.sendgrid.com/settings/api_keys):
SENDGRID_API_KEY=SG...

4. AWS Credentials (from AWS IAM Console):
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-west-1
AWS_BUCKET_NAME=your-bucket-name

5. Redis URL:
REDIS_URL=redis://localhost:6379
"
