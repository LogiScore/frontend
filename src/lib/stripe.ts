// Stripe integration service for LogiScore
import { loadStripe, Stripe, StripeElements, StripeElement } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rxlqv2OLXWq2oiietu8CyKM';

// Stripe instance
let stripe: Stripe | null = null;

// Initialize Stripe
export async function initializeStripe(): Promise<Stripe> {
  if (!stripe) {
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
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
    const stripeInstance = await initializeStripe();
    
    const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      return { paymentMethod: null, error };
    }

    return { paymentMethod, error: null };
  } catch (error) {
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
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#6772e5',
    },
    invalid: {
      iconColor: '#fa755a',
      color: '#fa755a',
    },
  },
};

// Test card numbers for development
export const testCardNumbers = {
  success: '4242424242424242',
  decline: '4000000000000002',
  requiresAuthentication: '4000002500003155',
  requires3DS: '4000008400001629',
};
