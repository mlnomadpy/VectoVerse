<template>
  <div class="tutorial-content">
    <!-- Progress bar -->
    <div class="tutorial-progress-container">
      <div class="tutorial-progress-bar" :style="{ width: tutorialManager.progress + '%' }"></div>
    </div>
    
    <!-- Step indicator -->
    <div class="tutorial-step-indicator">
      Step {{ tutorialManager.currentStep + 1 }} of {{ tutorialManager.tutorialSteps.length }}
    </div>
    
    <!-- Current step content -->
    <div v-if="tutorialManager.currentStepData" class="tutorial-step">
      <h3 v-html="tutorialManager.currentStepData.title"></h3>
      <p v-html="tutorialManager.currentStepData.content"></p>
    </div>
    
    <!-- Navigation buttons -->
    <div class="tutorial-navigation">
      <button 
        class="btn-compact btn-secondary"
        :disabled="tutorialManager.isFirstStep"
        @click="tutorialManager.previousStep"
      >
        ← Previous
      </button>
      
      <div class="tutorial-step-dots">
        <span 
          v-for="(step, index) in tutorialManager.tutorialSteps" 
          :key="index"
          class="step-dot"
          :class="{ active: index === tutorialManager.currentStep, completed: index < tutorialManager.currentStep }"
          @click="tutorialManager.goToStep(index)"
        ></span>
      </div>
      
      <button 
        class="btn-compact btn-primary"
        @click="tutorialManager.nextStep"
      >
        {{ tutorialManager.isLastStep ? 'Finish 🎉' : 'Next →' }}
      </button>
    </div>
    
    <!-- Keyboard shortcuts help -->
    <div class="tutorial-help">
      <small>
        💡 Use arrow keys to navigate, numbers 1-9 for quick step access, or ESC to exit
      </small>
    </div>
    
    <!-- Classic tutorial features from original -->
    <div class="tutorial-features" v-if="tutorialManager.currentStep === 0">
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <div class="feature-text">
            <strong>Vector Elements:</strong> Each vector is represented as an atomic element with unique properties
          </div>
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <div class="feature-text">
            <strong>Force Visualization:</strong> See relationships through various similarity metrics (cosine, correlation, etc.)
          </div>
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">🧠</span>
          <div class="feature-text">
            <strong>Neural Mode:</strong> Transform vectors into neural network representations with different activation functions
          </div>
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">🔬</span>
          <div class="feature-text">
            <strong>Analysis Studio:</strong> Deep dive into vector properties, clustering, and statistical analysis
          </div>
        </div>
      </div>
      
    <!-- Quick tips for final step -->
    <div class="tutorial-tips" v-if="tutorialManager.isLastStep">
        <h5>Quick Tips:</h5>
        <ul>
          <li>Click on any vector element to view detailed properties</li>
          <li>Use the controls toolbar to adjust dimensions and generate new vectors</li>
          <li>Toggle forces to see vector relationships in real-time</li>
          <li>Try Neural Mode for advanced visualization</li>
          <li>Upload your own vector data in various formats</li>
        <li>Press ? anytime to see keyboard shortcuts</li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { useTutorialManager } from '../../composables/useTutorialManager'

const tutorialManager = useTutorialManager()
</script>

<style scoped>
.tutorial-content {
  padding: 0;
  max-width: 500px;
  margin: 0 auto;
}

.tutorial-progress-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}

.tutorial-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.tutorial-step-indicator {
  text-align: center;
  font-size: 0.9em;
  opacity: 0.8;
  margin-bottom: 15px;
  color: var(--text-secondary);
}

.tutorial-step h3 {
  margin: 0 0 15px 0;
  font-size: 1.4em;
  text-align: center;
  color: var(--text-primary);
}

.tutorial-step p {
  margin: 0 0 25px 0;
  line-height: 1.6;
  font-size: 1em;
  text-align: center;
  color: var(--text-secondary);
}

.tutorial-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.tutorial-step-dots {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: var(--primary);
  transform: scale(1.3);
}

.step-dot.completed {
  background: var(--success);
}

.step-dot:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.2);
}

.tutorial-help {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tutorial-help small {
  color: var(--text-secondary);
  opacity: 0.8;
}

.tutorial-features {
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.feature-icon {
  font-size: 1.2em;
  min-width: 24px;
}

.feature-text {
  flex: 1;
}

.feature-text strong {
  color: var(--primary);
  display: block;
  margin-bottom: 4px;
}

.tutorial-tips {
  margin-top: 20px;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.tutorial-tips h5 {
  margin: 0 0 10px 0;
  color: var(--primary);
  font-size: 1.1em;
}

.tutorial-tips ul {
  margin: 0;
  padding-left: 20px;
}

.tutorial-tips li {
  margin-bottom: 6px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tutorial highlight animation */
:global(.tutorial-highlight) {
  animation: tutorialPulse 2s infinite;
  border: 3px solid #ffd700 !important;
  border-radius: 8px !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6) !important;
}

@keyframes tutorialPulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.9);
    transform: scale(1.02);
  }
}

@media (max-width: 768px) {
  .tutorial-navigation {
    flex-direction: column;
    gap: 10px;
  }
  
  .tutorial-step-dots {
    order: -1;
    margin-bottom: 10px;
  }
  
  .feature-item {
    flex-direction: column;
    text-align: center;
  }
}
</style> 