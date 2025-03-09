// src/orders.js
import { reactive } from 'vue';
import localStorageDB from './services/localStorageDB';

// Initial menu data
const defaultMenu = [
  { id: 'item1', name: 'Burger', price: 8.99, category: 'Main Course' },
  { id: 'item2', name: 'Pizza', price: 12.99, category: 'Main Course' },
  { id: 'item3', name: 'Salad', price: 6.99, category: 'Starters' },
  { id: 'item4', name: 'Ice Cream', price: 4.99, category: 'Desserts' },
  { id: 'item5', name: 'Coffee', price: 2.99, category: 'Beverages' },
  // Add more items as needed
];

export const store = reactive({
  // State
  menu: [],
  orders: [],
  tableNumber: null,
  orderHistory: [],
  isLoading: false,
  error: null,
  
  // Initialize the store
  init() {
    try {
      this.isLoading = true;
      
      // Load menu from localStorage or use default
      const savedMenu = localStorageDB.getData('restaurant_menu');
      this.menu = savedMenu || defaultMenu;
      
      // If menu was not found in localStorage, save the default
      if (!savedMenu) {
        localStorageDB.saveData('restaurant_menu', defaultMenu);
      }
      
      // Load saved table number
      const savedTableNumber = localStorageDB.getData('current_table');
      if (savedTableNumber) {
        this.tableNumber = savedTableNumber;
        
        // Load active order for this table
        this.loadActiveOrder();
      }
      
      this.isLoading = false;
    } catch (err) {
      this.error = err.message;
      this.isLoading = false;
      console.error('Failed to initialize store:', err);
    }
  },
  
  // Set table number
  setTableNumber(number) {
    this.tableNumber = number;
    localStorageDB.saveData('current_table', number);
    
    // Load any existing active order for this table
    this.loadActiveOrder();
  },
  
  // Load active order for current table
  loadActiveOrder() {
    try {
      if (!this.tableNumber) return;
      
      // Get all orders
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      // Find active order for current table
      const activeOrder = allOrders.find(
        order => order.tableNumber === this.tableNumber && order.status === 'active'
      );
      
      if (activeOrder) {
        this.orders = activeOrder.items || [];
      } else {
        this.orders = [];
      }
    } catch (err) {
      this.error = err.message;
      console.error('Failed to load active order:', err);
    }
  },
  
  // Save current order to localStorage
  saveCurrentOrder() {
    try {
      if (!this.tableNumber || this.orders.length === 0) return;
      
      // Get all orders
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      // Find index of active order for current table
      const activeOrderIndex = allOrders.findIndex(
        order => order.tableNumber === this.tableNumber && order.status === 'active'
      );
      
      if (activeOrderIndex >= 0) {
        // Update existing order
        allOrders[activeOrderIndex].items = this.orders;
        allOrders[activeOrderIndex].totalAmount = this.getOrderTotal();
        allOrders[activeOrderIndex].updatedAt = new Date().toISOString();
      } else {
        // Create new order
        const newOrder = {
          id: localStorageDB.generateId(),
          tableNumber: this.tableNumber,
          items: this.orders,
          status: 'active',
          totalAmount: this.getOrderTotal(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        allOrders.push(newOrder);
      }
      
      // Save updated orders
      localStorageDB.saveData('restaurant_orders', allOrders);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to save order:', err);
    }
  },
  
  // Add item to order
  addToOrder(item) {
    const existingItem = this.orders.find(orderItem => orderItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.orders.push({
        ...item,
        quantity: 1
      });
    }
    
    // Save to localStorage
    this.saveCurrentOrder();
  },
  
  // Remove item from order
  removeFromOrder(id) {
    this.orders = this.orders.filter(item => item.id !== id);
    
    // Save to localStorage
    this.saveCurrentOrder();
  },
  
  // Update item quantity
  updateQuantity(id, quantity) {
    if (quantity <= 0) {
      return this.removeFromOrder(id);
    }
    
    const item = this.orders.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
    }
    
    // Save to localStorage
    this.saveCurrentOrder();
  },
  
  // Calculate order total
  getOrderTotal() {
    return this.orders.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },
  
  // Submit order
  submitOrder() {
    if (this.orders.length === 0 || !this.tableNumber) {
      return null;
    }
    
    try {
      // Get all orders
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      // Find active order for current table
      const activeOrderIndex = allOrders.findIndex(
        order => order.tableNumber === this.tableNumber && order.status === 'active'
      );
      
      let submittedOrder;
      
      if (activeOrderIndex >= 0) {
        // Update the order status to 'submitted'
        allOrders[activeOrderIndex].status = 'submitted';
        allOrders[activeOrderIndex].items = this.orders;
        allOrders[activeOrderIndex].totalAmount = this.getOrderTotal();
        allOrders[activeOrderIndex].submittedAt = new Date().toISOString();
        
        submittedOrder = allOrders[activeOrderIndex];
      } else {
        // Create a new submitted order
        submittedOrder = {
          id: localStorageDB.generateId(),
          tableNumber: this.tableNumber,
          items: this.orders,
          status: 'submitted',
          totalAmount: this.getOrderTotal(),
          createdAt: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        };
        
        allOrders.push(submittedOrder);
      }
      
      // Save updated orders
      localStorageDB.saveData('restaurant_orders', allOrders);
      
      // Clear the current order
      this.orders = [];
      
      return submittedOrder;
    } catch (err) {
      this.error = err.message;
      console.error('Failed to submit order:', err);
      return null;
    }
  },
  
  // Load order history
  loadOrderHistory() {
    try {
      // Get all orders
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      // Filter for submitted orders for current table
      this.orderHistory = allOrders.filter(
        order => order.tableNumber === this.tableNumber && order.status === 'submitted'
      );
    } catch (err) {
      this.error = err.message;
      console.error('Failed to load order history:', err);
    }
  },
  
  // Update menu item
  updateMenuItem(item) {
    try {
      const index = this.menu.findIndex(menuItem => menuItem.id === item.id);
      
      if (index >= 0) {
        this.menu[index] = item;
      } else {
        // Add new item with generated ID if it doesn't exist
        const newItem = { ...item, id: item.id || localStorageDB.generateId() };
        this.menu.push(newItem);
      }
      
      // Save updated menu
      localStorageDB.saveData('restaurant_menu', this.menu);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to update menu item:', err);
    }
  },
  
  // Delete menu item
  deleteMenuItem(id) {
    try {
      this.menu = this.menu.filter(item => item.id !== id);
      
      // Save updated menu
      localStorageDB.saveData('restaurant_menu', this.menu);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to delete menu item:', err);
    }
  },
  
  // Clear all data (for testing)
  clearAllData() {
    localStorageDB.removeData('restaurant_menu');
    localStorageDB.removeData('restaurant_orders');
    localStorageDB.removeData('current_table');
    this.menu = defaultMenu;
    this.orders = [];
    this.tableNumber = null;
    this.orderHistory = [];
  }
});

// Initialize the store on import
store.init();