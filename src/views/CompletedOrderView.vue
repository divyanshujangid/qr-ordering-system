<!-- src/views/CompletedOrderView.vue -->
<template>
    <div class="p-4 max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link :to="{ name: 'order-history' }" class="mr-4 text-blue-600">
          <span class="inline-block transform rotate-180">&rarr;</span> Back to History
        </router-link>
        <h1 class="text-2xl font-bold">Receipt</h1>
      </div>
  
      <div v-if="!order.orderId" class="text-center py-12">
        <p class="text-gray-500 text-lg">Order not found</p>
        <router-link to="/active-orders" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
          View Active Orders
        </router-link>
      </div>
      
      <div v-else>
        <Bill :orderId="orderId" />
        
        <div class="mt-6 text-center">
          <router-link to="/active-orders" class="bg-blue-600 text-white px-6 py-2 rounded inline-block">
            Return to Orders
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  import Bill from '@/components/Bill.vue';
  
  export default {
    name: 'CompletedOrderView',
    components: {
      Bill
    },
    props: {
      orderId: {
        type: String,
        required: true
      }
    },
    computed: {
      ...mapState({
        completedOrders: state => state.billing.completedOrders
      }),
      order() {
        return this.completedOrders.find(order => order.orderId === this.orderId) || {};
      }
    }
  }
  </script>