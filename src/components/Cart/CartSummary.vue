<template>
  <div class="cart-summary">
    <button @click="isCartOpen = !isCartOpen" class="cart-button">
      Cart ({{ totalItems }})
    </button>
    
    <div v-if="isCartOpen" class="cart-modal">
      <div class="cart-header">
        <h3>Your Order</h3>
        <button @click="isCartOpen = false" class="close-button">×</button>
      </div>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        Your cart is empty
      </div>
      
      <div v-else class="cart-items">
        <div 
          v-for="(item, index) in cartItems" 
          :key="index"
          class="cart-item"
        >
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
          
          <div class="quantity-controls">
            <button @click="updateQuantity(index, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(index, item.quantity + 1)">+</button>
          </div>
        </div>
      </div>
      
      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="total">
          <span>Total:</span>
          <span>${{ totalPrice.toFixed(2) }}</span>
        </div>
        
        <button @click="checkout" class="checkout-button">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCart } from '@/composables/useCart'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const { 
      cartItems, 
      isCartOpen, 
      updateQuantity, 
      totalPrice, 
      totalItems 
    } = useCart()
    
    const checkout = () => {
      isCartOpen.value = false
      router.push('/checkout')
    }
    
    return {
      cartItems,
      isCartOpen,
      updateQuantity,
      totalPrice,
      totalItems,
      checkout
    }
  }
}
</script>

<style scoped>
.cart-summary {
  position: relative;
}

.cart-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cart-modal {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.empty-cart {
  padding: 30px;
  text-align: center;
  color: #888;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 5px 0;
}

.item-price {
  margin: 0;
  color: #666;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: #f8f8f8;
  font-size: 16px;
  cursor: pointer;
}

.quantity-controls span {
  margin: 0 10px;
}

.cart-footer {
  padding: 15px;
  border-top: 1px solid #eee;
}

.total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 15px;
}

.checkout-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>