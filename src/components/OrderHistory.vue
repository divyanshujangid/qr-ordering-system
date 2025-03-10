<template>
  <div class="history-page">
    <div class="page-header">
      <h1>Order History</h1>
      <button class="back-button" @click="$router.push('/')">
        Back to Menu
      </button>
    </div>
    
    <div v-if="store.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading order history...</p>
    </div>
    
    <div v-else-if="store.orderHistory.length === 0" class="empty-history">
      <div class="empty-icon">📋</div>
      <h3>No Order History</h3>
      <p>You haven't placed any orders yet.</p>
      <button class="primary-button" @click="$router.push('/')">
        Go to Menu
      </button>
    </div>
    
    <div v-else class="orders-container">
      <div v-for="order in store.orderHistory" :key="order.id" class="order-card">
        <div class="order-header">
          <div>
            <h3>Order #{{ order.id.slice(-4) }}</h3>
            <p class="order-date">{{ formatDate(order.submittedAt) }}</p>
          </div>
          <div class="order-total">₹ {{ order.totalAmount.toFixed(2) }}</div>
        </div>
        
        <div class="order-details">
          <h4>Items</h4>
          <ul class="item-list">
            <li v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-info">
                <span class="item-quantity">{{ item.quantity }}x</span>
                <span class="item-name">{{ item.name }}</span>
              </div>
              <span class="item-price">₹ {{ (item.price * item.quantity).toFixed(2) }}</span>
            </li>
          </ul>
        </div>
        
        <div class="order-actions">
          <button class="reorder-button" @click="reorderItems(order)">
            Reorder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { store } from '../orders.js';

export default {
  name: 'OrderHistoryPage',
  data() {
    return {
      store: store
    };
  },
  created() {
    this.store.loadOrderHistory();
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    reorderItems(order) {
      this.store.clearOrder();
      const unavailableItems = [];
      order.items.forEach(item => {
        const menuItem = this.store.menu.find(menuItem => menuItem.id === item.id);
        if (menuItem) {
          this.store.addToOrderWithQuantity(menuItem, item.quantity);
        } else {
          unavailableItems.push(item.name);
        }
      });

      if (unavailableItems.length > 0) {
        alert(`Some items are no longer available: ${unavailableItems.join(', ')}`);
      }
      this.$router.push('/checkout');
    }
  }
}
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.back-button {
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
}

.back-button:hover {
  background-color: #e5e5e5;
}

/* Loading state */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #42b983;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-history {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-history h3 {
  margin: 10px 0;
  color: #2c3e50;
}

.empty-history p {
  color: #666;
  margin-bottom: 20px;
}

.primary-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #3aa876;
}

/* Order cards */
.orders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #eaeaea;
}

.order-header h3 {
  margin: 0;
  color: #2c3e50;
}

.order-date {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
}

.order-total {
  font-size: 18px;
  font-weight: 600;
  color: #42b983;
}

.order-details {
  padding: 16px 20px;
}

.order-details h4 {
  margin: 0 0 12px;
  color: #2c3e50;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  align-items: center;
}

.item-quantity {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.item-name {
  color: #333;
}

.item-price {
  font-weight: 500;
  color: #2c3e50;
}

.order-actions {
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
  text-align: right;
}

.reorder-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reorder-button:hover {
  background-color: #3aa876;
}

/* Responsive design */
@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-total {
    margin-top: 8px;
  }
}
</style>