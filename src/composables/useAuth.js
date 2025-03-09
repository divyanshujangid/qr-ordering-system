import { ref, computed } from 'vue'
import api from '@/services/api'
import router from '@/router'

// State will persist while the app is open
const user = ref(null)
const loading = ref(false)
const error = ref(null)

// Try to restore session
const storedUser = localStorage.getItem('user')
if (storedUser) {
  user.value = JSON.parse(storedUser)
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || '')
  
  const login = async (username, password) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/users/login', { username, password })
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    logout
  }
}