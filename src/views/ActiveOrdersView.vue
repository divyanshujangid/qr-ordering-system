<!-- src/views/ActiveOrdersView.vue (continued) -->
<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">Active Orders</h1>
      
      <div v-if="activeTables.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No active orders at the moment</p>
        <router-link to="/menu" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
          Create New Order
        </router-link>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="tableId in activeTables" :key="tableId" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-blue-600 text-white p-4">
            <h2 class="font-bold text-xl">Table #{{ tableId }}</h2>
            <p class="text-blue-100">{{ formatTime(getOrderByTable(tableId).timestamp) }}</p>
          </div>
          
          <div class="p-4">
            <div class="space-y-2 mb-4">
              <div v-for="(item, index) in getOrderByTable(tableId).items" :key="index" class="flex justify-between">
                <div>
                  <span class="font-medium">{{ item.name }}</span>
                  <span class="text-gray-600 ml-2">x{{ item.quantity }}</span>
                </div>
                <span>{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>
            
            <div class="border-t border-gray-200 pt-3 mt-4">
              <div class="flex justify-between font-bold">
                <span>Total:</span>
                <span>{{ formatCurrency(getOrderTotal(tableId)) }}</span>
              </div>
              
              <div class="mt-4 flex space-x-2">
                <router-link 
                  :to="{ name: 'table-order', params: { tableId }}" 
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700">
                  View Details
                </router-link>
                <router-link 
                  :to="{ name: 'checkout', params: { tableId }}" 
                  class="flex-1 bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700">
                  Checkout
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  
  export default {
    name: 'ActiveOrdersView',
    computed: {
      ...mapGetters({
        activeTables: 'billing/getAllActiveTables',
        getOrderByTable: 'billing/getOrderByTable',
        getOrderTotal: 'billing/getOrderTotal'
      })
    },
    methods: {
      formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(amount);
      },
      formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
    }
  }
  </script>