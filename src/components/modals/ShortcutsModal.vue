<template>
  <div class="shortcuts-content">
    <div class="shortcuts-grid">
      <div class="shortcuts-section">
        <h4>🚀 Quick Actions</h4>
        <div class="shortcut-item">
          <kbd>Ctrl+G</kbd>
          <span>Generate new vectors</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl+R</kbd>
          <span>Reset visualization</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl+E</kbd>
          <span>Export data</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl+A</kbd>
          <span>Open analysis modal</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl+H</kbd>
          <span>Show help/tutorial</span>
        </div>
      </div>

      <div class="shortcuts-section">
        <h4>🎯 Navigation</h4>
        <div class="shortcut-item">
          <kbd>Tab</kbd>
          <span>Navigate between controls</span>
        </div>
        <div class="shortcut-item">
          <kbd>↑ ↓ ← →</kbd>
          <span>Navigate between vectors</span>
        </div>
        <div class="shortcut-item">
          <kbd>Enter</kbd>
          <span>Select vector</span>
        </div>
        <div class="shortcut-item">
          <kbd>Space</kbd>
          <span>Activate button/control</span>
        </div>
        <div class="shortcut-item">
          <kbd>Escape</kbd>
          <span>Close modals</span>
        </div>
      </div>

      <div class="shortcuts-section">
        <h4>📊 Analysis</h4>
        <div class="shortcut-item">
          <kbd>P</kbd>
          <span>Run PCA analysis</span>
        </div>
        <div class="shortcut-item">
          <kbd>K</kbd>
          <span>Run K-means clustering</span>
        </div>
        <div class="shortcut-item">
          <kbd>S</kbd>
          <span>Similarity analysis</span>
        </div>
        <div class="shortcut-item">
          <kbd>T</kbd>
          <span>Statistical analysis</span>
        </div>
        <div class="shortcut-item">
          <kbd>N</kbd>
          <span>Toggle neural mode</span>
        </div>
      </div>

      <div class="shortcuts-section">
        <h4>⚙️ Controls</h4>
        <div class="shortcut-item">
          <kbd>F</kbd>
          <span>Toggle force visualization</span>
        </div>
        <div class="shortcut-item">
          <kbd>3</kbd>
          <span>Toggle 3D mode</span>
        </div>
        <div class="shortcut-item">
          <kbd>+</kbd>
          <span>Increase dimensions</span>
        </div>
        <div class="shortcut-item">
          <kbd>-</kbd>
          <span>Decrease dimensions</span>
        </div>
        <div class="shortcut-item">
          <kbd>?</kbd>
          <span>Show this help</span>
        </div>
      </div>
    </div>

    <div class="shortcuts-footer">
      <p class="shortcuts-tip">
        💡 <strong>Tip:</strong> Most shortcuts work when you're not typing in input fields
      </p>
      <button class="btn-primary" @click="emit('close')">
        Got it! 👍
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
.shortcuts-content {
  max-width: 700px;
  margin: 0 auto;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.shortcuts-section h4 {
  margin: 0 0 1rem 0;
  color: var(--primary);
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.shortcut-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

kbd {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.shortcut-item span {
  flex: 1;
  color: var(--text-secondary);
}

.shortcuts-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-tip {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.shortcuts-tip strong {
  color: var(--primary);
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .shortcut-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  kbd {
    min-width: auto;
    width: fit-content;
  }
}
</style> 