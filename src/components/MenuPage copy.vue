<!-- src/components/Menu.vue -->
<template>
  <div class="menu-page">
    <div v-if="tableNumber" class="table-info">
      You are ordering at Table {{ tableNumber }}
    </div>
    
    <div class="menu-section">
      <h2>Menu</h2>
      <div class="menu-categories">
        <div 
          v-for="category in categories" 
          :key="category"
          class="menu-category"
        >
          <h3>{{ category }}</h3>
          <div class="menu-items">
            <div 
              v-for="item in getItemsByCategory(category)" 
              :key="item.id"
              class="menu-item"
            >
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>${{ item.price.toFixed(2) }}</p>
              </div>
              <button @click="addToOrder(item)">Add to Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="order-section">
      <h2>Your Order</h2>
      <div v-if="!store.tableNumber" class="table-selection">
        <label for="table-select">Select your table number:</label>
        <select id="table-select" v-model="selectedTable">
          <option v-for="n in 20" :key="n" :value="n">Table {{ n }}</option>
        </select>
        <button @click="setTableNumber">Confirm Table</button>
      </div>
      
      <div v-if="store.orders.length === 0" class="empty-order">
        Your order is empty. Add items from the menu.
      </div>
      <div v-else class="order-items">
        <div 
          v-for="item in store.orders" 
          :key="item.id"
          class="order-item"
        >
          <div class="item-details">
            <h4>{{ item.name }}</h4>
            <p>${{ item.price.toFixed(2) }}</p>
          </div>
          <div class="quantity-controls">
            <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <button class="remove-button" @click="removeFromOrder(item.id)">Remove</button>
        </div>
        
        <div class="order-total">
          <h3>Total: ${{ store.getOrderTotal().toFixed(2) }}</h3>
        </div>
        
        <button class="submit-button" @click="submitOrder">Place Order</button>
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
      selectedTable: 1
    }
  },
  created() {
    if (this.tableNumber) {
      store.setTableNumber(this.tableNumber);
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
        alert(`Order placed successfully! Your order number is #${orderSummary.id.toString().slice(-4)}`);
        // You might want to redirect to a confirmation page
        this.$router.push('/history');
      }
    }
  }
}
</script>

<style scoped>
.menu-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.table-info {
  grid-column: 1 / -1;
  background-color: #42b983;
  color: white;
  padding: 10px;
  text-align: center;
  border-radius: 8px;
  font-weight: bold;
}

.table-selection {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f2f2f2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-selection select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.menu-section, .order-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.menu-category {
  margin-bottom: 30px;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.menu-item, .order-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.item-details {
  margin-bottom: 10px;
}

.item-details h4 {
  margin: 0 0 5px 0;
}

.item-details p {
  margin: 0;
  color: #666;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #3aa876;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.quantity-controls span {
  margin: 0 10px;
  font-weight: bold;
}

.remove-button {
  background-color: #ff4757;
}

.remove-button:hover {
  background-color: #e03e49;
}

.order-total {
  margin: 20px 0;
  text-align: right;
}

.submit-button {
  background-color: #2c3e50;
  padding: 12px 20px;
  width: 100%;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #1e2a36;
}

.empty-order {
  text-align: center;
  padding: 30px;
  color: #666;
}
</style>