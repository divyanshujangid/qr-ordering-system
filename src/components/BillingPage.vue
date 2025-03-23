<template>
    <div class="billing-container">
      <h1>Bill Summary</h1>
      <div v-for="item in orderDetails.items" :key="item.id" class="bill-item">
        <span>{{ item.name }}</span>
        <span>{{ item.quantity }} x ₹{{ item.price.toFixed(2) }}</span>
        <span>₹{{ (item.quantity * item.price).toFixed(2) }}</span>
      </div>
      <div class="total-charge">
        <span>Total</span>
        <span>₹{{ orderDetails.total.toFixed(2) }}</span>
      </div>
      <button class="payment-button" @click="proceedToPayment">Proceed to Payment</button>
    </div>
  </template>
  
  <script>
  export default {
    props: ['orderDetails'],
    methods: {
      proceedToPayment() {
        this.$router.push('/payment');  // Route to the payment page or modal
      }
    }
  }
  </script>
  