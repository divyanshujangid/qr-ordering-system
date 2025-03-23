<script>
import { createCheckoutSession } from '../services/payment';

export default {
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