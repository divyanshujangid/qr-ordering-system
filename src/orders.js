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
];

export const store = reactive({
  menu: [],
  orders: [],
  tableNumber: null,
  orderHistory: [],
  isLoading: false,
  error: null,

  init() {
    try {
      this.isLoading = true;
      
      const savedMenu = localStorageDB.getData('restaurant_menu');
      this.menu = savedMenu || defaultMenu;
      
      if (!savedMenu) {
        localStorageDB.saveData('restaurant_menu', defaultMenu);
      }
      
      const savedTableNumber = localStorageDB.getData('current_table');
      if (savedTableNumber) {
        this.tableNumber = savedTableNumber;
        
        this.loadActiveOrder();
      }
      
      this.isLoading = false;
    } catch (err) {
      this.error = err.message;
      this.isLoading = false;
      console.error('Failed to initialize store:', err);
    }
  },
  
  setTableNumber(number) {
    this.tableNumber = number;
    localStorageDB.saveData('current_table', number);
    
    this.loadActiveOrder();
  },
  
  loadActiveOrder() {
    try {
      if (!this.tableNumber) return;
      
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
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
  
  saveCurrentOrder() {
    try {
      if (!this.tableNumber || this.orders.length === 0) return;
      
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      const activeOrderIndex = allOrders.findIndex(
        order => order.tableNumber === this.tableNumber && order.status === 'active'
      );
      
      if (activeOrderIndex >= 0) {
        allOrders[activeOrderIndex].items = this.orders;
        allOrders[activeOrderIndex].totalAmount = this.getOrderTotal();
        allOrders[activeOrderIndex].updatedAt = new Date().toISOString();
      } else {
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
      
      localStorageDB.saveData('restaurant_orders', allOrders);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to save order:', err);
    }
  },
  
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
    this.saveCurrentOrder();
  },
  
  removeFromOrder(id) {
    this.orders = this.orders.filter(item => item.id !== id);
    
    this.saveCurrentOrder();
  },
  
  updateQuantity(id, quantity) {
    if (quantity <= 0) {
      return this.removeFromOrder(id);
    }
    
    const item = this.orders.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
    }
    
    this.saveCurrentOrder();
  },
  
  getOrderTotal() {
    return this.orders.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },
  
  submitOrder() {
    if (this.orders.length === 0 || !this.tableNumber) {
      return null;
    }
    
    try {
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      const activeOrderIndex = allOrders.findIndex(
        order => order.tableNumber === this.tableNumber && order.status === 'active'
      );
      
      let submittedOrder;
      
      if (activeOrderIndex >= 0) {
        allOrders[activeOrderIndex].status = 'submitted';
        allOrders[activeOrderIndex].items = this.orders;
        allOrders[activeOrderIndex].totalAmount = this.getOrderTotal();
        allOrders[activeOrderIndex].submittedAt = new Date().toISOString();
        
        submittedOrder = allOrders[activeOrderIndex];
      } else {
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
      
      localStorageDB.saveData('restaurant_orders', allOrders);
      
      this.orders = [];
      
      return submittedOrder;
    } catch (err) {
      this.error = err.message;
      console.error('Failed to submit order:', err);
      return null;
    }
  },
  
  loadOrderHistory() {
    try {
      const allOrders = localStorageDB.getData('restaurant_orders') || [];
      
      this.orderHistory = allOrders.filter(
        order => order.tableNumber === this.tableNumber && order.status === 'submitted'
      );
    } catch (err) {
      this.error = err.message;
      console.error('Failed to load order history:', err);
    }
  },
  
  updateMenuItem(item) {
    try {
      const index = this.menu.findIndex(menuItem => menuItem.id === item.id);
      
      if (index >= 0) {
        this.menu[index] = item;
      } else {
        const newItem = { ...item, id: item.id || localStorageDB.generateId() };
        this.menu.push(newItem);
      }
      
      localStorageDB.saveData('restaurant_menu', this.menu);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to update menu item:', err);
    }
  },
  deleteMenuItem(id) {
    try {
      this.menu = this.menu.filter(item => item.id !== id);
      
      localStorageDB.saveData('restaurant_menu', this.menu);
    } catch (err) {
      this.error = err.message;
      console.error('Failed to delete menu item:', err);
    }
  },
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

store.init();