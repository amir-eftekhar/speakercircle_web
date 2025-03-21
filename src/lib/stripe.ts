import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialize Stripe on the server side
let stripeInstance: Stripe | null = null;

// Only initialize Stripe if we have a secret key
if (typeof process !== 'undefined' && process.env && process.env.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // Match the required API version
  });
}

export const stripe = stripeInstance as Stripe;

// Load Stripe with your publishable key for client-side
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Create a Stripe product and price for a class or event
export async function createStripeProduct({
  name,
  description,
  price,
  type,
  id,
}: {
  name: string;
  description: string;
  price: number | null;
  type: 'class' | 'event';
  id: string;
}) {
  if (!price || price <= 0) {
    return { productId: null, priceId: null };
  }

  try {
    // Create a product in Stripe
    const product = await stripe.products.create({
      name,
      description,
      metadata: {
        type,
        id,
      },
    });

    // Create a price for the product
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
    });

    return {
      productId: product.id,
      priceId: stripePrice.id,
    };
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
}

// Create a checkout session for enrollment or event registration
export async function createCheckoutSession({
  priceId,
  userId,
  enrollmentId,
  eventRegistrationId,
  successUrl,
  cancelUrl,
  customerEmail,
  isRecurring = false,
}: {
  priceId: string;
  userId: string;
  enrollmentId?: string;
  eventRegistrationId?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  isRecurring?: boolean;
}) {
  try {
    // Ensure URLs are valid by adding a default base URL if needed
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Make sure URLs are absolute
    const formattedSuccessUrl = successUrl.startsWith('http') ? 
      successUrl : 
      `${baseUrl}${successUrl.startsWith('/') ? '' : '/'}${successUrl}`;
    
    const formattedCancelUrl = cancelUrl.startsWith('http') ? 
      cancelUrl : 
      `${baseUrl}${cancelUrl.startsWith('/') ? '' : '/'}${cancelUrl}`;
    
    console.log('Creating checkout session with URLs:', { formattedSuccessUrl, formattedCancelUrl });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: formattedSuccessUrl,
      cancel_url: formattedCancelUrl,
      customer_email: customerEmail,
      metadata: {
        userId,
        ...(enrollmentId ? { enrollmentId } : {}),
        ...(eventRegistrationId ? { eventRegistrationId } : {}),
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Update a Stripe product's metadata
export async function updateStripeProductMetadata({
  productId,
  metadata,
}: {
  productId: string;
  metadata: Record<string, string>;
}) {
  try {
    const updatedProduct = await stripe.products.update(productId, {
      metadata,
    });
    return updatedProduct;
  } catch (error) {
    console.error('Error updating Stripe product metadata:', error);
    throw error;
  }
}

// Client-side function to redirect to Stripe Checkout
export async function redirectToCheckout(params: {
  sessionId?: string;
  eventId?: string | number;
  eventTitle?: string;
  price?: number;
  quantity?: number;
  registrationType?: string;
  email?: string;
}) {
  try {
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // If we have a sessionId, use it directly
    if (params.sessionId) {
      const result = await stripe.redirectToCheckout({
        sessionId: params.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      return;
    }
    
    // If we don't have a sessionId, we need to create a checkout session first
    if (params.eventId) {
      // Call our API to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: params.eventId,
          price: params.price,
          quantity: params.quantity || 1,
          email: params.email,
          registrationType: params.registrationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      // If the API returns a URL, use it directly for redirection
      if (url) {
        window.location.href = url;
        return;
      }
      
      // Fallback to using the Stripe SDK if only sessionId is provided
      if (sessionId) {
        const result = await stripe.redirectToCheckout({
          sessionId,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        throw new Error('No session URL or ID was provided by the server');
      }
    } else {
      throw new Error('Either sessionId or eventId must be provided');
    }
  } catch (error) {
    console.error('Error in redirectToCheckout:', error);
    throw error;
  }
}
