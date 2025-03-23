// src/store/modules/billing.js
export default {
    namespaced: true,
    state: {
      activeOrders: {},
      completedOrders: [],
      taxRate: 0.08, // 8% tax
      serviceCharge: 0.05, // 5% service charge
    },
    mutations: {
      ADD_ITEM_TO_ORDER(state, { tableId, item }) {
        if (!state.activeOrders[tableId]) {
          state.activeOrders[tableId] = {
            tableId,
            items: [],
            timestamp: new Date().toISOString(),
            status: 'active',
            customerId: null,
          };
        }
        
        // Check if item already exists in order
        const existingItemIndex = state.activeOrders[tableId].items.findIndex(
          orderItem => orderItem.id === item.id && 
                      JSON.stringify(orderItem.options) === JSON.stringify(item.options || {})
        );
        
        if (existingItemIndex !== -1) {
          // Increment quantity if item already exists
          state.activeOrders[tableId].items[existingItemIndex].quantity += item.quantity || 1;
        } else {
          // Add new item
          state.activeOrders[tableId].items.push({
            ...item,
            quantity: item.quantity || 1,
            subtotal: (item.price * (item.quantity || 1))
          });
        }
      },
      REMOVE_ITEM_FROM_ORDER(state, { tableId, itemIndex }) {
        if (state.activeOrders[tableId] && state.activeOrders[tableId].items[itemIndex]) {
          state.activeOrders[tableId].items.splice(itemIndex, 1);
          
          // Remove the entire order if no items left
          if (state.activeOrders[tableId].items.length === 0) {
            delete state.activeOrders[tableId];
          }
        }
      },
      UPDATE_ITEM_QUANTITY(state, { tableId, itemIndex, quantity }) {
        if (state.activeOrders[tableId] && state.activeOrders[tableId].items[itemIndex]) {
          const item = state.activeOrders[tableId].items[itemIndex];
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
        }
      },
      COMPLETE_ORDER(state, { tableId, paymentMethod, customerInfo }) {
        if (state.activeOrders[tableId]) {
          const order = {...state.activeOrders[tableId]};
          
          // Add payment information
          order.paymentMethod = paymentMethod;
          order.customerInfo = customerInfo;
          order.completedAt = new Date().toISOString();
          order.status = 'completed';
          order.orderId = `ORD-${Date.now()}-${tableId}`;
          
          // Calculate totals
          order.subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
          order.tax = order.subtotal * state.taxRate;
          order.serviceCharge = order.subtotal * state.serviceCharge;
          order.total = order.subtotal + order.tax + order.serviceCharge;
          
          // Add to completed orders
          state.completedOrders.push(order);
          
          // Remove from active orders
          delete state.activeOrders[tableId];
        }
      },
      SET_TAX_RATE(state, rate) {
        state.taxRate = rate;
      },
      SET_SERVICE_CHARGE(state, rate) {
        state.serviceCharge = rate;
      }
    },
    getters: {
      getOrderByTable: (state) => (tableId) => {
        return state.activeOrders[tableId] || null;
      },
      getOrderSubtotal: (state) => (tableId) => {
        if (!state.activeOrders[tableId]) return 0;
        return state.activeOrders[tableId].items.reduce((sum, item) => sum + item.subtotal, 0);
      },
      getOrderTax: (state, getters) => (tableId) => {
        return getters.getOrderSubtotal(tableId) * state.taxRate;
      },
      getOrderServiceCharge: (state, getters) => (tableId) => {
        return getters.getOrderSubtotal(tableId) * state.serviceCharge;
      },
      getOrderTotal: (state, getters) => (tableId) => {
        return getters.getOrderSubtotal(tableId) + getters.getOrderTax(tableId) + getters.getOrderServiceCharge(tableId);
      },
      getAllActiveTables: (state) => {
        return Object.keys(state.activeOrders);
      },
      getCompletedOrders: (state) => {
        return state.completedOrders;
      }
    },
    actions: {
      addItemToOrder({ commit }, payload) {
        commit('ADD_ITEM_TO_ORDER', payload);
      },
      removeItemFromOrder({ commit }, payload) {
        commit('REMOVE_ITEM_FROM_ORDER', payload);
      },
      updateItemQuantity({ commit }, payload) {
        commit('UPDATE_ITEM_QUANTITY', payload);
      },
      completeOrder({ commit }, payload) {
        commit('COMPLETE_ORDER', payload);
      },
      setTaxRate({ commit }, rate) {
        commit('SET_TAX_RATE', rate);
      },
      setServiceCharge({ commit }, rate) {
        commit('SET_SERVICE_CHARGE', rate);
      }
    }
  };