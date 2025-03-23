<template>
    <div v-if="isVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div class="bg-white p-5 rounded-lg w-96">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-semibold">Order Receipt</h3>
          <button @click="$emit('closeReceipt')" class="">&times;</button>
        </div>
        <div>
          <h4 class="font-bold mb-2">QR Restaurant</h4>
          <p>123 Dining Street, Foodville</p>
          <p><strong>Order #:</strong> {{ currentOrder.id }}</p>
          <p><strong>Table:</strong> {{ currentOrder.table }}</p>
          <div class="mt-2">
            <div v-for="item in currentOrder.items" :key="item.id" class="flex justify-between">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span>₹{{ item.price.toFixed(2) }}</span>
            </div>
            <div class="mt-2">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex space-x-4 mt-4">
          <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" @click="openPaymentModal">
            Pay ₹{{ calculateTotal().toFixed(2) }}
          </button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="$emit('printReceipt')">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // import { loadStripe } from '@stripe/stripe-js';
  export default {
  name: 'ReceiptGenerator',
  props: {
    amount: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      default: 'Customer'
    },
    email: {
      type: String,
      default: ''
    },
    contact: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: 'Purchase'
    },
    currentOrder: {
      type: Object,
      required: true
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      key_id: process.env.RAZORPAY_KEY_ID, // Ensure this is set in your environment variables
    };
  },
  methods: {
    printReceipt() {
      // Printing logic here
    },
    calculateSubtotal() {
      return this.currentOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    calculateTax() {
      return this.calculateSubtotal() * 0.05; // 5% tax
    },
    calculateTotal() {
      return this.calculateSubtotal() + this.calculateTax();
    },
    
    async openPaymentModal() {
      this.isLoading = true;
      
      try {
        const orderData = await this.createOrder();
        const options = {
          key: this.key_id,
          amount: this.calculateTotal, // amount is expected to be in the smallest currency unit (e.g., paise)
          currency: "INR",
          name: this.name,
          description: this.description,
          order_id: orderData.id,
          handler: this.paymentSuccessHandler,
          prefill: {
            name: this.name,
            email: this.email,
            contact: this.contact
          },
          notes: {
            address: "Your Company Address"
          },
          theme: {
            color: "#3399cc"
          }
        };
        // console.log('ggugggggg', openPaymentModal);
        this.initiatePayment(options);
      } catch (error) {
        console.error("Payment initialization failed:", error);
        this.$emit('payment-error', error);
        alert('Failed to create order. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    
    async createOrder() {
      const amount = this.calculateTotal()
      const payload = {
            amount: amount, // Assuming backend expects amount to calculate something
            currency: "INR",
            // You can include more data as needed
          };
      try {
        const response = await fetch('http://localhost:8000/payment_app/initiate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload) // Send the payload to the backend
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        return await response.json();
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    
    initiatePayment(options) {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', (response) => {
        this.$emit('payment-failed', response.error);
        alert('Payment failed: ' + response.error.description);
      });
    },
    
    paymentSuccessHandler(response) {
      // Handle successful payment
      this.$emit('payment-success', response);
      console.log("Payment successful:", response);
    },
  },
  mounted() {
    // Load Razorpay script dynamically
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay SDK loaded.');
      };
      document.body.appendChild(script);
    }
  }
}
  </script>
  
  <style scoped>
  /* Tailwind utility classes can be used here if you prefer or have Tailwind in your project */
  </style>
  