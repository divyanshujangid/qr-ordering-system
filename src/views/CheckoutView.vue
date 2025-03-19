<!-- src/views/CheckoutView.vue -->
<template>
    <div class="p-4 max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link :to="{ name: 'active-orders' }" class="mr-4 text-blue-600">
          <span class="inline-block transform rotate-180">&rarr;</span> Back
        </router-link>
        <h1 class="text-2xl font-bold">Checkout - Table #{{ tableId }}</h1>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-4">
          <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div v-if="!order || !order.items || order.items.length === 0" class="text-center py-8">
            <p class="text-gray-500">No items in this order</p>
            <router-link to="/menu" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
              Add Items
            </router-link>
          </div>
          
          <div v-else>
            <div class="space-y-3 mb-6">
              <div v-for="(item, index) in order.items" :key="index" class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="mr-4">
                    <button 
                      @click="removeItem(index)" 
                      class="text-red-500 hover:bg-red-100 rounded-full h-8 w-8 flex items-center justify-center">
                      &times;
                    </button>
                  </div>
                  <div>
                    <div class="font-medium">{{ item.name }}</div>
                    <div v-if="item.options && Object.keys(item.options).length > 0" class="text-sm text-gray-600">
                      <span v-for="(value, key, i) in item.options" :key="key">
                        {{ key }}: {{ value }}{{ i < Object.keys(item.options).length - 1 ? ', ' : '' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4">
                  <div class="flex items-center">
                    <button 
                      @click="decrementQuantity(index)" 
                      class="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center"
                      :disabled="item.quantity <= 1">
                      -
                    </button>
                    <span class="mx-2 w-6 text-center">{{ item.quantity }}</span>
                    <button 
                      @click="incrementQuantity(index)" 
                      class="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center">
                      +
                    </button>
                  </div>
                  
                  <div class="text-right w-24">
                    <div>{{ formatCurrency(item.subtotal) }}</div>
                    <div class="text-sm text-gray-500">@ {{ formatCurrency(item.price) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="border-t border-gray-200 pt-4 space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax ({{ (taxRate * 100).toFixed(0) }}%)</span>
                <span>{{ formatCurrency(tax) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Service Charge ({{ (serviceCharge * 100).toFixed(0) }}%)</span>
                <span>{{ formatCurrency(serviceChargeAmount) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{{ formatCurrency(total) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md">
          <Bill 
            :tableId="tableId" 
            :printable="false"
            @payment-completed="onPaymentCompleted" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters } from 'vuex';
  import Bill from '@/components/Bill.vue';
  
  export default {
    name: 'CheckoutView',
    components: {
      Bill
    },
    props: {
      tableId: {
        type: [String, Number],
        required: true
      }
    },
    computed: {
      ...mapState({
        taxRate: state => state.billing.taxRate,
        serviceCharge: state => state.billing.serviceCharge
      }),
      ...mapGetters({
        getOrderByTable: 'billing/getOrderByTable'
      }),
      order() {
        return this.getOrderByTable(this.tableId) || { items: [] };
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
      removeItem(index) {
        this.$store.dispatch('billing/removeItemFromOrder', {
          tableId: this.tableId,
          itemIndex: index
        });
        
        // Redirect back to active orders if no items left
        if (this.order && (!this.order.items || this.order.items.length === 0)) {
          this.$router.push({ name: 'active-orders' });
        }
      },
      incrementQuantity(index) {
        const item = this.order.items[index];
        this.$store.dispatch('billing/updateItemQuantity', {
          tableId: this.tableId,
          itemIndex: index,
          quantity: item.quantity + 1
        });
      },
      decrementQuantity(index) {
        const item = this.order.items[index];
        if (item.quantity > 1) {
          this.$store.dispatch('billing/updateItemQuantity', {
            tableId: this.tableId,
            itemIndex: index,
            quantity: item.quantity - 1
          });
        }
      },
      onPaymentCompleted() {
        // Handled by Bill component through router
      }
    }
  }
  </script>