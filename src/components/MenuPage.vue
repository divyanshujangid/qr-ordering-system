<template>
  <div class="restaurant-app">
    <div v-if="tableNumber" class="table-info">
      <div class="table-badge">
        <span class="table-icon">🍽️</span>
        <span>Table {{ tableNumber }}</span>
      </div>
    </div>
    
    <!-- Order Placed Receipt Modal -->
    <ReceiptModal
      :currentOrder="currentOrder"
      :isVisible="showReceipt"
      @closeReceipt="showReceipt = false"
      @startNewOrder="startNewOrder"
    />
    
    <div class="content-container">
      <div class="menu-section">
        <h2>Our Menu</h2>
        
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category"
            :class="['category-tab', selectedCategory === category ? 'active' : '']"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
        
        <div class="menu-items">
          <div 
            v-for="item in getItemsByCategory(selectedCategory)" 
            :key="item.id"
            class="menu-item"
          >
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p class="item-price">₹ {{ item.price.toFixed(2) }}</p>
            </div>
            <button class="add-button" @click="addToOrder(item)">
              <span class="button-icon">+</span> Add
            </button>
          </div>
        </div>
      </div>
      
      <div class="order-section">
        <h2>Your Order</h2>
        <div v-if="!store.tableNumber" class="table-selection">
          <label for="table-select">Select your table number:</label>
          <div class="selection-controls">
            <select id="table-select" v-model="selectedTable">
              <option v-for="n in 20" :key="n" :value="n">Table {{ n }}</option>
            </select>
            <button class="confirm-button" @click="setTableNumber">Confirm</button>
          </div>
        </div>
        
        <div v-if="store.orders.length === 0" class="empty-order">
          <div class="empty-cart-icon">🛒</div>
          <p>Your order is empty</p>
          <p class="empty-cart-hint">Add items from the menu to get started</p>
        </div>
        
        <div v-else class="order-content">
          <div class="order-items">
            <div 
              v-for="item in store.orders" 
              :key="item.id"
              class="order-item"
            >
              <div class="order-item-details">
                <h4>{{ item.name }}</h4>
                <p class="item-price">₹ {{ item.price.toFixed(2) }}</p>
              </div>
              
              <div class="order-item-actions">
                <div class="quantity-controls">
                  <button 
                    class="quantity-btn decrease"
                    :class="{ 'disabled': item.quantity <= 1 }"
                    @click="updateQuantity(item.id, item.quantity - 1)"
                  >−</button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button 
                    class="quantity-btn increase"
                    @click="updateQuantity(item.id, item.quantity + 1)"
                  >+</button>
                </div>
                <button class="remove-button" @click="removeFromOrder(item.id)">
                  <span class="trash-icon">🗑️</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="order-summary">
            <div class="order-total">
              <span>Total</span>
              <span class="total-amount">₹ {{ store.getOrderTotal().toFixed(2) }}</span>
            </div>
            
            <button class="submit-button" @click="submitOrder">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReceiptModal from './ReceiptModal.vue';
import { store } from '../orders.js'

export default {
  components: {
    ReceiptModal
  },
  name: 'MenuPage',
  props: {
    tableNumber: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      store,
      selectedTable: 1,
      selectedCategory: null,
      showReceipt: false,
      currentOrder: {
        id: '',
        timestamp: Date.now(),
        items: [],
        paymentMethod: 'Cash/Card on Delivery',
        paymentStatus: 'Order Placed'
      }
    }
  },
  created() {
    if (this.tableNumber) {
      store.setTableNumber(this.tableNumber);
    }
    if (this.categories.length > 0) {
      this.selectedCategory = this.categories[0];
    }
  },
  computed: {
    categories() {
      return [...new Set(store.menu.map(item => item.category))];
    }
  },
  methods: {
    getItemsByCategory(category) {
      return store.menu.filter(item => item.category === category);
    },
    addToOrder(item) {
      store.addToOrder(item);
    },
    removeFromOrder(id) {
      store.removeFromOrder(id);
    },
    updateQuantity(id, quantity) {
      store.updateQuantity(id, quantity);
    },
    setTableNumber() {
      store.setTableNumber(this.selectedTable);
    },
    submitOrder() {
      const orderSummary = store.submitOrder();
      if (orderSummary) {
        // Update the current order object with the submitted order details
        this.currentOrder = {
          ...orderSummary,
          timestamp: Date.now(),
          paymentMethod: 'Cash/Card on Delivery',
          paymentStatus: 'Order Placed'
        };
        
        // Show receipt modal
        this.showReceipt = true;
        
        // Optionally, also show a success message
        
      }
    },
    closeReceipt() {
      this.showReceipt = false;
    },
    startNewOrder() {
      this.showReceipt = false;
      store.clearOrder();
      this.$router.push('/');
    },
    printReceipt() {
  const receiptContent = document.querySelector('.receipt-content').innerHTML;
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 12px; }
          .receipt-content { width: 300px; margin: 0 auto; }
          /* Add other styles as needed */
        </style>
      </head>
      <body>
        ${receiptContent}
      </body>
    </html>
  `);
      
      printWindow.document.close();
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    calculateSubtotal() {
      return this.currentOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    calculateTax() {
      return this.calculateSubtotal() * 0.05; // 5% tax
    },
    calculateTotal() {
      return this.calculateSubtotal() + this.calculateTax();
    }
  }
}
</script>

<style scoped>
.restaurant-app {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  position: relative;
}

.content-container {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
  padding: 16px;
}

@media (max-width: 768px) {
  .content-container {
    grid-template-columns: 1fr;
  }
}

.table-info {
  padding: 16px;
  background: linear-gradient(135deg, #3a8162, #42b983);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.table-badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

.menu-section, .order-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  height: 90%;
}

h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #42b983;
  position: relative;
}

.category-tabs {
  width: 30%;
  display:block;
  flex-wrap: wrap;
  /* gap: 8px; */
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.category-tab {
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab:hover {
  background-color: #e5e5e5;
}

.category-tab.active {
  background-color: #42b983;
  color: white;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.menu-item {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.item-details h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.item-price {
  font-weight: 600;
  color: #42b983;
  margin: 0;
  font-size: 1.1rem;
}

.add-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-button:hover {
  background-color: #389e70;
}

.button-icon {
  font-size: 1.1rem;
}

.table-selection {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}

.table-selection label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #555;
}

.selection-controls {
  display: flex;
  gap: 8px;
}

.table-selection select {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1rem;
}

.confirm-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.confirm-button:hover {
  background-color: #389e70;
}

.empty-order {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-cart-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-cart-hint {
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 8px;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.order-item:hover {
  background-color: #f2f2f2;
}

.order-item-details h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #2c3e50;
}

.order-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #eee;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: #555;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #f2f2f2;
}

.quantity-btn.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity {
  width: 20px;
  text-align: center;
  font-weight: 600;
}

.remove-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: #ff5252;
}

.trash-icon {
  font-size: 0.9rem;
}

.order-summary {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.total-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
}

.submit-button {
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.submit-button:hover {
  background-color: #1e2a36;
}

.submit-button:active {
  transform: scale(0.98);
}

/* Receipt Modal Styles */
.receipt-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.receipt-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.receipt-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #555;
}

.receipt-body {
  padding: 16px;
  flex-grow: 1;
}

.receipt-content {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.receipt-items {
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
  padding: 10px 0;
  margin: 10px 0;
}

.receipt-item {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
}

.item-name-qty {
  display: flex;
}

.qty {
  width: 30px;
}

.receipt-summary {
  margin-top: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
}

.total {
  font-weight: bold;
  margin-top: 10px;
  padding-top: 5px;
  border-top: 1px solid #ddd;
}

.receipt-footer {
  margin-top: 20px;
  font-size: 0.7rem;
  text-align: center;
  color: #777;
}

.receipt-actions {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.print-button, .new-order-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.print-button {
  background-color: #4a90e2;
  color: white;
}

.print-button:hover {
  background-color: #3a80d2;
}

.new-order-button {
  background-color: #42b983;
  color: white;
}

.new-order-button:hover {
  background-color: #389e70;
}

.table-number {
  font-weight: bold;
  margin-top: 5px;
}
</style>