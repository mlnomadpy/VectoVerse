<template>
  <div class="activation-help-content">
    <h4>🔌 Neural Activation Functions</h4>
    <div class="activation-list">
      <div class="activation-item">
        <h5>Sigmoid</h5>
        <p>Smooth S-curve, outputs between 0 and 1</p>
        <div class="formula">σ(x) = 1 / (1 + e^(-x))</div>
      </div>
      
      <div class="activation-item">
        <h5>Tanh</h5>
        <p>Hyperbolic tangent, outputs between -1 and 1</p>
        <div class="formula">tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))</div>
      </div>
      
      <div class="activation-item">
        <h5>ReLU</h5>
        <p>Rectified Linear Unit, simple and effective</p>
        <div class="formula">ReLU(x) = max(0, x)</div>
      </div>
      
      <div class="activation-item">
        <h5>Leaky ReLU</h5>
        <p>Modified ReLU allowing small negative values</p>
        <div class="formula">LeakyReLU(x) = max(0.01x, x)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Activation functions help
</script>

<style scoped>
.activation-help-content {
  color: var(--text-primary);
}

.activation-help-content h4 {
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
}

.activation-list {
  margin: 1rem 0;
}

.activation-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.activation-item h5 {
  color: var(--accent-secondary);
  margin: 0 0 0.5rem 0;
}

.activation-item p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
}

.formula {
  background: var(--bg-tertiary);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-left: 3px solid var(--accent-secondary);
}
</style> 