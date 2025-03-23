// OrderConfirmation.vue
<template>
  <div class="max-w-md mx-auto p-4">
    <div class="bg-green-50 rounded-lg p-4 mb-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <h2 class="text-xl font-bold text-green-800">Thank you for your order!</h2>
      <p class="text-green-700">Your order #{{ order.id }} has been received.</p>
    </div>
    
    <receipt-generator 
      :order="order" 
      :show-print-button="true"
      :show-qr-code="true"
      @email-receipt="handleEmailReceipt" 
    />
  </div>
</template>

<script>
import ReceiptGenerator from './ReceiptGenerator.vue';
import { emailReceiptService } from '../services/emailService';

export default {
  components: {
    ReceiptGenerator
  },
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleEmailReceipt({ order, receiptHtml }) {
      // Show loading state
      this.$emit('notification', {
        type: 'info',
        message: 'Sending receipt to ' + order.customerEmail + '...'
      });
      
      emailReceiptService.sendEmail({
        to: order.customerEmail,
        subject: `Your Receipt for Order #${order.id} from QR Cafe`,
        html: receiptHtml
      })
      .then(() => {
        this.$emit('notification', {
          type: 'success',
          message: 'Receipt sent successfully!'
        });
      })
      .catch(error => {
        this.$emit('notification', {
          type: 'error',
          message: 'Failed to send receipt: ' + error.message
        });
      });
    }
  }
};
</script>