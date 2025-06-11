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
  color: #333;
}

.activation-list {
  margin: 1rem 0;
}

.activation-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.activation-item h5 {
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.activation-item p {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.formula {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-left: 3px solid #667eea;
}
</style> 