// src/services/localStorageDB.js

/**
 * A simple database service using localStorage
 * This allows data to persist between page reloads
 */
export default {
    // Save data to localStorage
    saveData(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
      }
    },
  
    // Get data from localStorage
    getData(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Error getting data from localStorage:', error);
        return null;
      }
    },
  
    // Remove data from localStorage
    removeData(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing data from localStorage:', error);
        return false;
      }
    },
    
    // Generate a unique ID (for orders, menu items, etc.)
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  };