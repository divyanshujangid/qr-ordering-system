// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Menu from '../components/MenuPage.vue'
import OrderHistory from '../components/OrderHistory.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import QRCodeGenerator from '../components/QRCodeGenerator.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Menu
  },
  {
    path: '/order',
    name: 'Order',
    component: Menu,
    props: (route) => ({ tableNumber: parseInt(route.query.table) || null })
  },
  {
    path: '/history',
    name: 'History',
    component: OrderHistory
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard
  },
  {
    path: '/qr',
    name: 'QRCode',
    component: QRCodeGenerator
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router