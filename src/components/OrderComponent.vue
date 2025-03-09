// src/components/OrderComponent.vue
<script>
import { createCheckoutSession } from '../services/payment';

export default {
  // existing code...
  methods: {
    async proceedToCheckout() {
      try {
        await createCheckoutSession(this.orderItems);
      } catch (error) {
        console.error('Error proceeding to checkout:', error);
      }
    }
  }
}
</script>