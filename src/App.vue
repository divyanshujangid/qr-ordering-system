<!-- src/App.vue -->
<template>
  <div id="app">
    <header>
      <h1>Café QR Ordering System</h1>
      <nav>
        <router-link to="/">Menu</router-link>
        <router-link to="/history">Order History</router-link>
        <router-link to="/admin">Admin</router-link>
        <router-link to="/qr">Generate QR</router-link>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f2f2f2;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 15px;
}

nav {
  display: flex;
  justify-content: center;
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 10px;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 8px 15px;
  margin: 0 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: #3d5a80;
}

nav a.router-link-active {
  background-color: #42b983;
}

main {
  min-height: 70vh;
}
</style>