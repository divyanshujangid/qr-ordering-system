<template>
    <div class="payment-container">
      <button 
        class="payment-button"
        @click="openPaymentModal"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Processing...' : 'Pay Now' }}
      </button>
    </div>
  </template>
  <script>
export default {
  name: 'RazorpayPayment',
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
    }
  },
  data() {
    return {
      isLoading: false,
      key_id: process.env.RAZORPAY_KEY_ID, // Ensure this is set in your environment variables
    };
  },
  methods: {
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
  .payment-container {
    margin: 20px 0;
  }
  
  .payment-button {
    background-color: #3399cc;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .payment-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>