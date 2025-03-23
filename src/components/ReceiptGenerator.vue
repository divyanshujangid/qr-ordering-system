<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Order Receipt</h3>
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600" @click="$emit('closeReceipt')">
          <span class="fas fa-times"></span>
        </button>
      </div>
      <div class="p-4">
        <h4 class="text-sm font-bold">QR Restaurant</h4>
        <p>123 Dining Street, Foodville</p>
        <p>Order #{{ currentOrder.id }}</p>
        <p>Table {{ currentOrder.tableNumber }}</p>
        <ul class="my-2">
          <li v-for="item in currentOrder.items" :key="item.id" class="flex justify-between py-1">
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <span>₹{{ item.price.toFixed(2) }}</span>
          </li>
        </ul>
        <div class="mt-4">
          <p>Subtotal: ₹{{ calculateSubtotal().toFixed(2) }}</p>
          <p>Tax (5%): ₹{{ calculateTax().toFixed(2) }}</p>
          <p class="font-bold">Total: ₹{{ calculateTotal().toFixed(2) }}</p>
        </div>
      </div>
      <div class="flex justify-between items-center p-4 border-t">
        <button class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" @click="openPaymentModal">
          Pay ₹{{ calculateTotal().toFixed(2) }}
        </button>
        <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" @click="printReceipt">
          Print Receipt
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
    initiatePayment() {
      // Payment logic or redirection to a payment gateway
      alert('Redirecting to payment gateway...');
    },
    async openPaymentModal() {
      this.isLoading = true;
      
      try {
        const orderData = await this.createOrder();
        const options = {
          key: this.key_id,
          amount: orderData.amount, // amount is expected to be in the smallest currency unit (e.g., paise)
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
      try {
        const response = await fetch('http://localhost:8000/payment_app/initiate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
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
/* Your Tailwind CSS styles here */
</style>
