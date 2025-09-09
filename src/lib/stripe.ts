// Stripe integration service for LogiScore
import * as StripeJS from '@stripe/stripe-js';

// Extract the types and functions we need
const { loadStripe } = StripeJS;
type Stripe = StripeJS.Stripe;
type StripeElements = StripeJS.StripeElements;
type StripeElement = StripeJS.StripeElement;

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rxlqv2OLXWq2oiietu8CyKM';

// Log the key being used (for debugging)
console.log('Stripe publishable key loaded:', STRIPE_PUBLISHABLE_KEY ? 'Yes' : 'No');
console.log('Key starts with:', STRIPE_PUBLISHABLE_KEY.substring(0, 10));

// Stripe instance
let stripe: Stripe | null = null;

// Initialize Stripe
export async function initializeStripe(): Promise<Stripe> {
  if (!stripe) {
    console.log('Initializing Stripe with key:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      console.error('Failed to load Stripe - stripe instance is null');
      throw new Error('Failed to load Stripe');
    }
    console.log('Stripe initialized successfully');
  }
  return stripe;
}

// Get Stripe instance
export function getStripe(): Stripe | null {
  return stripe;
}

// Create payment method
export async function createPaymentMethod(
  cardElement: StripeElement,
  billingDetails?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }
): Promise<{ paymentMethod: any; error?: any }> {
  try {
    console.log('Initializing Stripe for payment method creation...');
    const stripeInstance = await initializeStripe();
    
    console.log('Creating payment method with Stripe...');
    const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      console.error('Stripe createPaymentMethod error:', error);
      return { paymentMethod: null, error };
    }

    console.log('Payment method created successfully');
    return { paymentMethod, error: null };
  } catch (error) {
    console.error('Error in createPaymentMethod:', error);
    return { paymentMethod: null, error };
  }
}

// Confirm payment intent (if needed for immediate payments)
export async function confirmPayment(
  clientSecret: string,
  paymentMethodId: string
): Promise<{ paymentIntent: any; error?: any }> {
  try {
    const stripeInstance = await initializeStripe();
    
    const { paymentIntent, error } = await stripeInstance.confirmCardPayment(
      clientSecret,
      {
        payment_method: paymentMethodId,
      }
    );

    if (error) {
      return { paymentIntent: null, error };
    }

    return { paymentIntent, error: null };
  } catch (error) {
    return { paymentIntent: null, error };
  }
}

// Handle payment errors
export function getPaymentErrorMessage(error: any): string {
  if (error.type === 'card_error' || error.type === 'validation_error') {
    return error.message;
  } else {
    return 'An unexpected error occurred.';
  }
}

// Stripe Elements options
export const stripeElementsOptions = {
  // Use setup mode for subscriptions (no amount required)
  mode: 'setup',
  currency: 'usd',
  // Disable automatic payment method detection
  paymentMethodTypes: ['card'],
};

// Test card numbers for development
export const testCardNumbers = {
  success: '4242424242424242',
  decline: '4000000000000002',
  requiresAuthentication: '4000002500003155',
  requires3DS: '4000008400001629',
};
