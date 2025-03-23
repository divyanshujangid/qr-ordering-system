<template>
  <div class="checkout-form">
    <form @submit.prevent="submitPayment">
      <div id="card-element"></div>
      <button type="submit">Submit Payment</button>
    </form>
  </div>
</template>

<script>import { Stripe } from '@stripe/stripe-js';
export default {
  data() {
    return {
      stripe: null,
      card: null,
    };
  },
  mounted() {
      this.stripe = Stripe('pk_test_51R3q1wBauzbUZCLL2IYfFBOIo6Kv1nz8xiN6NYMgBq6sEErU0WB3kFgkPG8gfwuNwWDg1h9XeednZCLBBQwIFxn700zJbG1i4p'); // Replace 'your_public_key' with your actual Stripe public key
      const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  },
  methods: {
    async submitPayment() {
      const { token, error } = await this.stripe.createToken(this.card);
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('Success! Token:', token.id);
        this.processPayment(token);
      }
    },
    processPayment(token) {
      fetch('/.netlify/functions/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.id, amount: 2000 }), // Example: $20.00 charge
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Payment successful!');
        } else {
          console.error('Payment error:', data.error);
          alert('Payment failed. Please try again.');
        }
      })
      .catch(error => {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      });
    }
  }
}
</script>

<style>
.checkout-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  border: none;
  color: white;
  cursor: pointer;
}
button:hover {
  background-color: #367c4f;
}
</style>
  