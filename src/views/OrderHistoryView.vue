<!-- src/views/OrderHistoryView.vue (continued) -->
<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">Order History</h1>
      
      <div v-if="completedOrders.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No completed orders</p>
        <router-link to="/active-orders" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
          View Active Orders
        </router-link>
      </div>
      
      <div v-else>
        <div class="mb-4">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Search orders..."
            class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.orderId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatOrderId(order.orderId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Table #{{ order.tableId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.completedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ order.items.length }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {{ formatCurrency(order.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getPaymentMethodName(order.paymentMethod) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <router-link 
                    :to="{ name: 'completed-order', params: { orderId: order.orderId }}" 
                    class="text-blue-600 hover:text-blue-900">
                    View
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  
  export default {
    name: 'OrderHistoryView',
    data() {
      return {
        searchTerm: '',
        paymentMethods: [
          { id: 'cash', name: 'Cash' },
          { id: 'card', name: 'Credit Card' },
          { id: 'upi', name: 'UPI / QR Pay' }
        ]
      };
    },
    computed: {
      ...mapState({
        completedOrders: state => state.billing.completedOrders
      }),
      filteredOrders() {
        if (!this.searchTerm) {
          return [...this.completedOrders].sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt)
          );
        }
        
        const searchLower = this.searchTerm.toLowerCase();
        return this.completedOrders.filter(order => {
          return (
            order.orderId.toLowerCase().includes(searchLower) ||
            order.tableId.toString().includes(searchLower) ||
            this.formatDate(order.completedAt).toLowerCase().includes(searchLower)
          );
        }).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      }
    },
    methods: {
      formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(amount);
      },
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      },
      formatOrderId(orderId) {
        // Shows a shorter version of the order ID for display
        const parts = orderId.split('-');
        if (parts.length > 2) {
          return `#${parts[2]}`;
        }
        return orderId;
      },
      getPaymentMethodName(methodId) {
        const method = this.paymentMethods.find(method => method.id === methodId);
        return method ? method.name : methodId;
      }
    }
  }
  </script>