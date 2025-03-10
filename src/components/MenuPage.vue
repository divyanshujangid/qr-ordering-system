<template>
  <div class="restaurant-app">
    <div v-if="tableNumber" class="table-info">
      <div class="table-badge">
        <span class="table-icon">🍽️</span>
        <span>Table {{ tableNumber }}</span>
      </div>
    </div>
    
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
import { store } from '../orders.js'

export default {
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
      selectedCategory: null
    }
  },
  created() {
    if (this.tableNumber) {
      store.setTableNumber(this.tableNumber);
    }
    // Set default selected category to the first category
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
    // Using SweetAlert2 instead of standard alert
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: `Your order number is #${orderSummary.id.toString().slice(-4)}`,
        confirmButtonColor: '#42b983',
      }).then(() => {
        // Redirect after the user closes the alert
        this.$router.push('/history');
      });
    });
  }
  }
}
}
</script>

<style scoped>
/* Main layout */
.restaurant-app {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
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

/* Table info */
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

/* Menu section */
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

/* Category tabs */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

/* Menu items */
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

/* Table selection */
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

/* Empty order */
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

/* Order items */
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

/* Quantity controls */
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

/* Order summary */
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
</style>