import Stripe from 'stripe';

// Check if Stripe API key is available
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the secret key if available
export const stripe = hasStripeKey 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  : null as unknown as Stripe;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return hasStripeKey;
};

// Export Stripe types for use in other files
export type { Stripe };
