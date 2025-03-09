import { ref, computed } from 'vue'

// Persistent cart items
const cartItems = ref([])
const isCartOpen = ref(false)

// Try to restore cart from localStorage
const savedCart = localStorage.getItem('cart')
if (savedCart) {
  cartItems.value = JSON.parse(savedCart)
}

// Save cart to localStorage when changes occur
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
}

export function useCart() {
  // Add item to cart
  const addToCart = (item) => {
    // Check if item already exists in cart
    const existingItem = cartItems.value.find(cartItem => 
      cartItem._id === item._id && 
      JSON.stringify(cartItem.selectedOptions) === JSON.stringify(item.selectedOptions || {})
    )
    
    if (existingItem) {
      // Increase quantity
      existingItem.quantity += 1
    } else {
      // Add new item with quantity 1
      cartItems.value.push({
        ...item,
        quantity: 1,
        selectedOptions: item.selectedOptions || {}
      })
    }
    
    // Save to localStorage
    saveCart()
  }
  
  // Remove item from cart
  const removeFromCart = (index) => {
    cartItems.value.splice(index, 1)
    saveCart()
  }
  
  // Update item quantity
  const updateQuantity = (index, quantity) => {
    if (quantity > 0) {
      cartItems.value[index].quantity = quantity
    } else {
      cartItems.value.splice(index, 1)
    }
    saveCart()
  }
  
  // Clear cart
  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }
  
  // Calculate total price
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => {
      // Add base price × quantity
      let itemTotal = item.price * item.quantity
      
      // Add option prices if any
      if (item.selectedOptions) {
        Object.values(item.selectedOptions).forEach(option => {
          if (option && option.price) {
            itemTotal += option.price * item.quantity
          }
        })
      }
      
      return total + itemTotal
    }, 0)
  })
  
  // Calculate total items
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })
  
  return {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems
  }
}