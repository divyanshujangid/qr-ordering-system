<template>
  <div class="menu-container">
    <div class="categories">
      <button 
        v-for="category in categories" 
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>
    
    <div class="menu-items">
      <div v-if="loading" class="loading">Loading menu...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <h2>{{ selectedCategory }}</h2>
        <div class="items-grid">
          <menu-item 
            v-for="item in filteredItems" 
            :key="item._id" 
            :item="item"
            @add-to-cart="addToCart"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import MenuItem from './MenuItem.vue'
import api from '@/services/api'
import { useCart } from '@/composables/useCart'

export default {
  components: {
    MenuItem
  },
  setup() {
    const menuItems = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedCategory = ref('All')
    const { addToCart } = useCart()
    
    // Fetch menu data
    const fetchMenu = async () => {
      try {
        loading.value = true
        const response = await api.get('/menu')
        menuItems.value = response.data
      } catch (err) {
        error.value = err.message || 'Failed to load menu'
      } finally {
        loading.value = false
      }
    }
    
    // Get unique categories
    const categories = computed(() => {
      const cats = ['All', ...new Set(menuItems.value.map(item => item.category))]
      return cats
    })
    
    // Filter items by selected category
    const filteredItems = computed(() => {
      if (selectedCategory.value === 'All') {
        return menuItems.value
      }
      return menuItems.value.filter(item => item.category === selectedCategory.value)
    })
    
    onMounted(fetchMenu)
    
    return {
      menuItems,
      loading,
      error,
      categories,
      selectedCategory,
      filteredItems,
      addToCart
    }
  }
}
</script>

<style scoped>
.menu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.categories {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.categories button {
  padding: 8px 16px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
}

.categories button.active {
  background-color: #4caf50;
  color: white;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}
</style>