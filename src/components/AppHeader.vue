<template>
  <header class="app-header">
    <h1>🌌 Welcome to the Vectoverse</h1>
    <p>An Interactive Atomic-Inspired Framework for Understanding Vector Interactions & Resonance Forces</p>
    <div class="header-info">
      <span>🔍 Click vectors to explore similarities</span>
      <span>⚡ Visualize resonance forces</span>
      <span>🎛️ Edit input vectors in real-time</span>
    </div>
  </header>
</template>

<script setup>
// Header component - primarily presentational
</script>

<style scoped>
.app-header {
  text-align: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  opacity: 0.9;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.header-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  opacity: 0.8;
}

.header-info span {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-header p {
    font-size: 1rem;
  }
  
  .header-info {
    gap: 1rem;
  }
  
  .header-info span {
    font-size: 0.8rem;
  }
}
</style> 