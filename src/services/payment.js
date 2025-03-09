// src/services/payment.js
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
  }
  return stripePromise;
};

export const createCheckoutSession = async (orderItems) => {
  const stripe = await getStripe();
  
  // You would typically call your backend API here to create a checkout session
  // This is a simplified example
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: orderItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe works with cents
        },
        quantity: item.quantity,
      })),
    }),
  });
  
  const session = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });
  
  if (result.error) {
    console.error(result.error.message);
  }
};