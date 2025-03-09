<template>
  <div class="admin-page">
    <h1>Restaurant Admin</h1>
    
    <div class="admin-tabs">
      <button 
        :class="['tab-button', activeTab === 'menu' ? 'active' : '']" 
        @click="activeTab = 'menu'"
      >
        Menu Management
      </button>
      <button 
        :class="['tab-button', activeTab === 'orders' ? 'active' : '']" 
        @click="activeTab = 'orders'"
      >
        Orders
      </button>
    </div>
    
    <!-- Menu Management Tab -->
    <div v-if="activeTab === 'menu'" class="tab-content">
      <h2>Menu Items</h2>
      
      <!-- Add/Edit Menu Item Form -->
      <div class="form-container">
        <h3>{{ editingItem.id ? 'Edit Item' : 'Add New Item' }}</h3>
        <form @submit.prevent="saveMenuItem">
          <div class="form-group">
            <label for="item-name">Name:</label>
            <input 
              id="item-name" 
              v-model="editingItem.name" 
              required 
              placeholder="Item name"
            />
          </div>
          
          <div class="form-group">
            <label for="item-price">Price ($):</label>
            <input 
              id="item-price" 
              v-model.number="editingItem.price" 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00"
            />
          </div>
          
          <div class="form-group">
            <label for="item-category">Category:</label>
            <select id="item-category" v-model="editingItem.category" required>
              <option value="">Select a category</option>
              <option 
                v-for="category in categories" 
                :key="category" 
                :value="category"
              >
                {{ category }}
              </option>
              <option value="new">+ Add new category</option>
            </select>
          </div>
          
          <div v-if="editingItem.category === 'new'" class="form-group">
            <label for="new-category">New Category:</label>
            <input 
              id="new-category" 
              v-model="newCategory" 
              required 
              placeholder="Category name"
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="save-button">Save Item</button>
            <button type="button" class="cancel-button" @click="resetForm">Cancel</button>
          </div>
        </form>
      </div>
      
      <!-- Menu Items List -->
      <div class="menu-items-list">
        <h3>Current Menu</h3>
        
        <div v-if="store.menu.length === 0" class="empty-message">
          No menu items found. Add some items using the form.
        </div>
        
        <div v-else>
          <div v-for="category in categories" :key="category" class="category-section">
            <h4>{{ category }}</h4>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in getItemsByCategory(category)" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>${{ item.price.toFixed(2) }}</td>
                  <td class="action-buttons">
                    <button class="edit-button" @click="editItem(item)">Edit</button>
                    <button class="delete-button" @click="deleteItem(item.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <h2>Order Management</h2>
      
      <div class="order-filters">
        <label>
          Filter by status:
          <select v-model="orderStatusFilter">
            <option value="all">All Orders</option>
            <option value="active">Active Orders</option>
            <option value="submitted">Submitted Orders</option>
          </select>
        </label>
      </div>
      
      <div v-if="filteredOrders.length === 0" class="empty-message">
        No orders found matching the selected filter.
      </div>
      
      <div v-else class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <h3>Order #{{ order.id.slice(-4) }}</h3>
            <span :class="['status-badge', order.status]">{{ order.status }}</span>
          </div>
          
          <div class="order-details">
            <p><strong>Table:</strong> {{ order.tableNumber }}</p>
            <p><strong>Created:</strong> {{ formatDate(order.createdAt) }}</p>
            <p v-if="order.submittedAt"><strong>Submitted:</strong> {{ formatDate(order.submittedAt) }}</p>
            <p><strong>Total:</strong> ${{ order.totalAmount.toFixed(2) }}</p>
          </div>
          
          <div class="order-items">
            <h4>Items</h4>
            <ul>
              <li v-for="item in order.items" :key="item.id">
                {{ item.quantity }}x {{ item.name }} - ${{ (item.price * item.quantity).toFixed(2) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { store } from '../orders.js';
import localStorageDB from '../services/localStorageDB';

export default {
  name: 'AdminPage',
  setup() {
    // Tab state
    const activeTab = ref('menu');
    
    // Menu management state
    const editingItem = ref({
      name: '',
      price: 0,
      category: ''
    });
    const newCategory = ref('');
    
    // Orders management state
    const orderStatusFilter = ref('all');
    const orders = ref([]);
    
    // Load all orders on mount
    onMounted(() => {
      loadOrders();
    });
    
    // Load orders from localStorage
    const loadOrders = () => {
      orders.value = localStorageDB.getData('restaurant_orders') || [];
    };
    
    // Computed properties
    const categories = computed(() => {
      return [...new Set(store.menu.map(item => item.category))];
    });
    
    const filteredOrders = computed(() => {
      if (orderStatusFilter.value === 'all') {
        return orders.value;
      }
      return orders.value.filter(order => order.status === orderStatusFilter.value);
    });
    
    // Methods
    const getItemsByCategory = (category) => {
      return store.menu.filter(item => item.category === category);
    };
    
    const resetForm = () => {
      editingItem.value = {
        name: '',
        price: 0,
        category: ''
      };
      newCategory.value = '';
    };
    
    const editItem = (item) => {
      editingItem.value = { ...item };
    };
    
    const saveMenuItem = () => {
      // Handle new category
      if (editingItem.value.category === 'new' && newCategory.value) {
        editingItem.value.category = newCategory.value;
      }
      
      // Save the item
      store.updateMenuItem(editingItem.value);
      
      // Reset form
      resetForm();
    };
    
    const deleteItem = (id) => {
      if (confirm('Are you sure you want to delete this item?')) {
        store.deleteMenuItem(id);
      }
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };
    
    return {
      store,
      activeTab,
      editingItem,
      newCategory,
      categories,
      orderStatusFilter,
      filteredOrders,
      getItemsByCategory,
      resetForm,
      editItem,
      saveMenuItem,
      deleteItem,
      formatDate
    };
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

/* Tabs */
.admin-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px 8px 0 0;
  margin-right: 5px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}

.tab-button.active {
  background-color: #42b983;
  color: white;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Form styles */
.form-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
}

/* Menu items list */
.menu-items-list {
  margin-top: 30px;
}

.category-section {
  margin-bottom: 30px;
}

.category-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.edit-button, .delete-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button {
  background-color: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
}

.delete-button {
  background-color: #ff6b6b;
  color: white;
}

/* Orders list */
.order-filters {
  margin-bottom: 20px;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #42b983;
  color: white;
}

.status-badge.submitted {
  background-color: #3498db;
  color: white;
}

.order-details p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.order-items {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.order-items h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.order-items ul {
  padding-left: 20px;
  margin: 0;
}

.order-items li {
  margin-bottom: 5px;
}

.empty-message {
  text-align: center;
  padding: 30px;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>