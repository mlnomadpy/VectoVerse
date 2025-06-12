<template>
  <div class="upload-help-content">
    <h4>📁 Supported File Formats</h4>
    <div class="format-list">
      <div class="format-item">
        <strong>.txt</strong> - Plain text with space/comma separated values
      </div>
      <div class="format-item">
        <strong>.csv</strong> - Comma-separated values
      </div>
      <div class="format-item">
        <strong>.json</strong> - JSON array format
      </div>
      <div class="format-item">
        <strong>.npy</strong> - NumPy array format
      </div>
      <div class="format-item">
        <strong>.mat</strong> - MATLAB matrix format
      </div>
    </div>
    
    <h4>📋 Example Formats</h4>
    <div class="example-section">
      <h5>CSV Format:</h5>
      <pre class="code-example">1.2, 0.5, -0.8, 2.1
0.3, 1.7, 0.2, -1.0
-0.5, 0.1, 1.9, 0.7</pre>
      
      <h5>JSON Format:</h5>
      <pre class="code-example">[[1.2, 0.5, -0.8, 2.1],
 [0.3, 1.7, 0.2, -1.0],
 [-0.5, 0.1, 1.9, 0.7]]</pre>
    </div>
  </div>
</template>

<script setup>
// Upload help modal
</script>

<style scoped>
.upload-help-content {
  color: var(--text-primary);
}

.upload-help-content h4 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.upload-help-content h5 {
  color: var(--accent-secondary);
  margin-bottom: 0.5rem;
}

.format-list {
  margin: 1rem 0;
}

.format-item {
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.example-section {
  margin-top: 1.5rem;
}

.code-example {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  border-left: 3px solid var(--accent-secondary);
}
</style> 