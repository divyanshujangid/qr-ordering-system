<template>
  <div class="checkout-container">
    <h1>Checkout</h1>
    <button @click="openCheckout">Pay with Razorpay</button>
  </div>
</template>

<script>
/* global Razorpay */ // Declare Razorpay as a global variable for ESLint

export default {
  name: 'PaymentCheckout',
  data() {
    return {
      order: null,
      razorpayKey: null, // Assuming you will fetch or set this somehow
    };
  },
  methods: {
    async fetchRazorpayKey() {
      // Placeholder for fetching the key from your backend or another secure source
      // const response = await fetch('/api/razorpay-key');
      // const data = await response.json();
      // this.razorpayKey = data.key;
      this.razorpayKey = 'YOUR_ACTUAL_PUBLIC_KEY'; // Temporary hardcoding, replace with the above commented lines
    },
    async createOrder() {
  try {
    const response = await fetch('http://localhost:8000/payment_app/initiate/', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to fetch order from the server.');
    const data = await response.json();
    this.order = data;
    if (!this.order || !this.order.id) throw new Error('No order data received.');
  } catch (error) {
    console.error('Error creating order:', error);
    alert(error.message);
  }
},

    openCheckout() {
      if (!this.order || !this.razorpayKey) {
        alert('Error: Order details not found or Razorpay key is missing.');
        return;
      }
      let options = {
        "key": this.razorpayKey,
        "amount": this.order.amount,
        "currency": "INR",
        "name": "Your Company Name",
        "description": "Test Transaction",
        "order_id": this.order.id,
        "handler": (response) => {
          alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
          // Optionally, redirect the user or perform further processing
          this.paymentSuccessHandler(response.razorpay_payment_id);
        },
        "prefill": {
          "name": "Customer Name",
          "email": "customer@example.com",
          "contact": "9999999999"
        },
        "theme": {
          "color": "#F37254"
        }
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
    },
    paymentSuccessHandler(paymentId) {
      // Handle successful payment here
      console.log('Payment was successful. Payment ID:', paymentId);
      // Redirect or update the UI as needed
    }
  },
  async mounted() {
    await this.fetchRazorpayKey();
    this.createOrder();
  }
};
</script>


<style scoped>
.checkout-container {
  text-align: center;
  margin-top: 50px;
}
</style>
