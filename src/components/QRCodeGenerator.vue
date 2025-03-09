// src/components/QRCodeGenerator.vue
<template>
  <div class="qr-container">
    <h3>Scan to order at Table {{ tableNumber }}</h3>
    <div class="qr-code">
      <qrcode :value="qrValue" :size="200" level="H"></qrcode>
    </div>
    <div class="table-selector">
      <label for="table-number">Change Table Number:</label>
      <select id="table-number" v-model="tableNumber">
        <option v-for="n in 20" :key="n" :value="n">Table {{ n }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode.vue'

export default {
  name: 'QRCodeGenerator',
  components: {
    qrcode: QRCode
  },
  data() {
    return {
      tableNumber: 1
    }
  },
  computed: {
    qrValue() {
      return `${window.location.origin}/order?table=${this.tableNumber}`;
    }
  }
}
</script>

<style scoped>
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-code {
  margin: 20px 0;
}

.table-selector {
  margin-top: 15px;
}

select {
  margin-left: 10px;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>