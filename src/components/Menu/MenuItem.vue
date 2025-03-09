<template>
  <div class="menu-item">
    <div class="image-container">
      <img :src="item.image || 'https://via.placeholder.com/150'" :alt="item.name">
      <span v-if="item.popular" class="popular-badge">Popular</span>
    </div>
    <div class="content">
      <h3>{{ item.name }}</h3>
      <p class="description">{{ item.description }}</p>
      <div class="price-action">
        <span class="price">${{ item.price.toFixed(2) }}</span>
        <button @click="addItem" :disabled="!item.available">
          <span v-if="item.available">Add to Cart</span>
          <span v-else>Unavailable</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const addItem = () => {
      emit('add-to-cart', props.item)
    }
    
    return {
      addItem
    }
  }
}
</script>

<style scoped>
.menu-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.menu-item:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  height: 180px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.content {
  padding: 15px;
}

.description {
  color: #666;
  margin: 8px 0;
  font-size: 0.9rem;
  height: 40px;
  overflow: hidden;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.price {
  font-weight: bold;
  font-size: 1.1rem;
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>