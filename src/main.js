// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import { createApp } from 'vue'

// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import 'firebase/auth';
// import 'firebase/analytics';

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// const app = createApp(App)

