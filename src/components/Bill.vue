<!-- src/components/Bill.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Cafe Order Receipt</h1>
        <p class="text-gray-600">Order #{{ order.orderId }}</p>
        <p class="text-gray-600">{{ formatDate(order.completedAt || order.timestamp) }}</p>
      </div>
  
      <div class="border-t border-b border-gray-200 py-4 mb-4">
        <div class="flex justify-between font-semibold mb-2">
          <span>Item</span>
          <div class="flex">
            <span class="w-16 text-right">Qty</span>
            <span class="w-24 text-right">Price</span>
            <span class="w-24 text-right">Subtotal</span>
          </div>
        </div>
  
        <div v-for="(item, index) in order.items" :key="index" class="flex justify-between py-2">
          <div class="flex-1">
            <div class="font-medium">{{ item.name }}</div>
            <div v-if="item.options && Object.keys(item.options).length > 0" class="text-sm text-gray-600">
              <div v-for="(value, key) in item.options" :key="key">
                {{ key }}: {{ value }}
              </div>
            </div>
          </div>
          <div class="flex">
            <span class="w-16 text-right">{{ item.quantity }}</span>
            <span class="w-24 text-right">{{ formatCurrency(item.price) }}</span>
            <span class="w-24 text-right">{{ formatCurrency(item.subtotal) }}</span>
          </div>
        </div>
      </div>
  
      <div class="space-y-2 mb-4">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Tax ({{ (taxRate * 100).toFixed(0) }}%)</span>
          <span>{{ formatCurrency(tax) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Service Charge ({{ (serviceCharge * 100).toFixed(0) }}%)</span>
          <span>{{ formatCurrency(serviceChargeAmount) }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
          <span>Total</span>
          <span>{{ formatCurrency(total) }}</span>
        </div>
      </div>
  
      <div v-if="!order.completedAt" class="mt-6">
        <h3 class="font-semibold mb-3">Payment Method</h3>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <button 
            v-for="method in paymentMethods" 
            :key="method.id"
            @click="selectedPaymentMethod = method.id"
            :class="['py-2 px-4 border rounded-md text-center', 
                     selectedPaymentMethod === method.id ? 
                     'bg-blue-100 border-blue-500' : 'border-gray-300']">
            {{ method.name }}
          </button>
        </div>
  
        <div class="mt-6">
          <button 
            @click="processPayment" 
            :disabled="!selectedPaymentMethod"
            :class="['w-full py-3 rounded-md font-medium text-white', 
                    !selectedPaymentMethod ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700']">
            Complete Payment
          </button>
        </div>
      </div>
  
      <div v-else class="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
        <div class="font-semibold">Payment Completed</div>
        <div>Method: {{ getPaymentMethodName(order.paymentMethod) }}</div>
        <div>Date: {{ formatDate(order.completedAt) }}</div>
      </div>
  
      <div class="mt-6 text-center text-gray-500 text-sm">
        <p>Thank you for visiting our cafe!</p>
        <p>Please come again soon.</p>
      </div>
  
      <div class="mt-8 text-center" v-if="printable">
        <button @click="printBill" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Print Receipt
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  
  export default {
    name: 'Bill',
    props: {
      tableId: {
        type: [String, Number],
        required: true
      },
      orderId: {
        type: String,
        default: null
      },
      printable: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        selectedPaymentMethod: null,
        paymentMethods: [
          { id: 'cash', name: 'Cash' },
          { id: 'card', name: 'Credit Card' },
          { id: 'upi', name: 'UPI / QR Pay' }
        ]
      };
    },
    computed: {
      ...mapState({
        taxRate: state => state.billing.taxRate,
        serviceCharge: state => state.billing.serviceCharge,
        activeOrders: state => state.billing.activeOrders,
        completedOrders: state => state.billing.completedOrders
      }),
      order() {
        if (this.orderId) {
          return this.completedOrders.find(order => order.orderId === this.orderId) || {};
        }
        return this.activeOrders[this.tableId] || { items: [] };
      },
      subtotal() {
        if (!this.order.items || this.order.items.length === 0) return 0;
        return this.order.items.reduce((sum, item) => sum + item.subtotal, 0);
      },
      tax() {
        return this.subtotal * this.taxRate;
      },
      serviceChargeAmount() {
        return this.subtotal * this.serviceCharge;
      },
      total() {
        return this.subtotal + this.tax + this.serviceChargeAmount;
      }
    },
    methods: {
      formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(amount);
      },
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      },
      getPaymentMethodName(methodId) {
        const method = this.paymentMethods.find(method => method.id === methodId);
        return method ? method.name : methodId;
      },
      processPayment() {
        if (!this.selectedPaymentMethod) return;
        
        this.$store.dispatch('billing/completeOrder', {
          tableId: this.tableId,
          paymentMethod: this.selectedPaymentMethod,
          customerInfo: {} // Could be expanded to include customer details if needed
        });
        
        this.$emit('payment-completed');
        
        // Redirect to completed order page
        this.$router.push({ 
          name: 'completed-order', 
          params: { 
            orderId: this.$store.state.billing.completedOrders[
              this.$store.state.billing.completedOrders.length - 1
            ].orderId 
          } 
        });
      },
      printBill() {
        window.print();
      }
    }
  }
  </script>
  
  <style scoped>
  @media print {
    button {
      display: none;
    }
    
    .shadow-md {
      box-shadow: none;
    }
    
    /* Add any other print-specific styles */
  }
  </style>