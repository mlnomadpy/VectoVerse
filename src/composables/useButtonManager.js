import { ref, nextTick } from 'vue'
import { useUIStore } from '@/stores/uiStore'

export function useButtonManager() {
  const uiStore = useUIStore()
  
  // State
  const loadingButtons = ref(new Set())
  const buttonConfigs = ref(new Map())
  
  // Enhanced button functionality
  const enhanceButton = (buttonElement, config = {}) => {
    if (!buttonElement) return
    
    const defaultConfig = {
      rippleEffect: true,
      loadingIndicator: true,
      hapticFeedback: false,
      soundEffect: false,
      animations: true,
      accessibility: true
    }
    
    const finalConfig = { ...defaultConfig, ...config }
    buttonConfigs.value.set(buttonElement, finalConfig)
    
    // Add event listeners
    if (finalConfig.rippleEffect) {
      buttonElement.addEventListener('click', (event) => createRippleEffect(buttonElement, event))
    }
    
    if (finalConfig.accessibility) {
      enhanceAccessibility(buttonElement)
    }
    
    if (finalConfig.animations) {
      addButtonAnimations(buttonElement)
    }
  }
  
  // Create ripple effect
  const createRippleEffect = (button, event) => {
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1;
    `
    
    // Add ripple animation CSS if not already present
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style')
      style.id = 'ripple-styles'
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .btn-enhanced {
          position: relative;
          overflow: hidden;
        }
      `
      document.head.appendChild(style)
    }
    
    button.classList.add('btn-enhanced')
    button.appendChild(ripple)
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove()
      }
    }, 600)
  }
  
  // Enhance button accessibility
  const enhanceAccessibility = (button) => {
    // Ensure button has proper ARIA attributes
    if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
      button.setAttribute('aria-label', 'Button')
    }
    
    // Add role if missing
    if (!button.getAttribute('role')) {
      button.setAttribute('role', 'button')
    }
    
    // Ensure button is keyboard accessible
    if (button.tagName.toLowerCase() !== 'button' && !button.getAttribute('tabindex')) {
      button.setAttribute('tabindex', '0')
    }
    
    // Add keyboard event listeners for non-button elements
    if (button.tagName.toLowerCase() !== 'button') {
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          button.click()
        }
      })
    }
  }
  
  // Add button animations
  const addButtonAnimations = (button) => {
    if (!document.querySelector('#button-animations')) {
      const style = document.createElement('style')
      style.id = 'button-animations'
      style.textContent = `
        .btn-animated {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-animated:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .btn-animated:active {
          transform: translateY(0);
        }
        .btn-animated:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
        .btn-loading {
          pointer-events: none;
          opacity: 0.7;
          position: relative;
        }
        .btn-loading::after {
          content: '';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
    
    button.classList.add('btn-animated')
  }
  
  // Set button loading state
  const setButtonLoading = (buttonElement, loading) => {
    if (!buttonElement) return
    
    const buttonId = buttonElement.id || `btn-${Date.now()}`
    
    if (loading) {
      loadingButtons.value.add(buttonId)
      buttonElement.classList.add('btn-loading')
      buttonElement.disabled = true
      
      // Store original text if not already stored
      if (!buttonElement.dataset.originalText) {
        buttonElement.dataset.originalText = buttonElement.textContent
      }
    } else {
      loadingButtons.value.delete(buttonId)
      buttonElement.classList.remove('btn-loading')
      buttonElement.disabled = false
      
      // Restore original text
      if (buttonElement.dataset.originalText) {
        buttonElement.textContent = buttonElement.dataset.originalText
      }
    }
  }
  
  // Execute button action with loading state
  const executeButtonAction = async (buttonElement, action, options = {}) => {
    const {
      showLoading = true,
      successMessage = null,
      errorMessage = 'Action failed'
    } = options
    
    if (showLoading) {
      setButtonLoading(buttonElement, true)
    }
    
    try {
      const result = await action()
      
      if (successMessage) {
        uiStore.showSuccess(successMessage)
      }
      
      return result
    } catch (error) {
      console.error('Button action error:', error)
      uiStore.showError(errorMessage)
      throw error
    } finally {
      if (showLoading) {
        setButtonLoading(buttonElement, false)
      }
    }
  }
  
  // Create modern button
  const createModernButton = (text, options = {}) => {
    const {
      variant = 'primary',
      size = 'medium',
      icon = null,
      onClick = null,
      disabled = false,
      loading = false
    } = options
    
    const button = document.createElement('button')
    button.className = `btn-modern btn-${variant} btn-${size}`
    
    if (icon) {
      const iconSpan = document.createElement('span')
      iconSpan.className = 'btn-icon'
      iconSpan.textContent = icon
      button.appendChild(iconSpan)
    }
    
    const textSpan = document.createElement('span')
    textSpan.className = 'btn-text'
    textSpan.textContent = text
    button.appendChild(textSpan)
    
    if (onClick) {
      button.addEventListener('click', onClick)
    }
    
    button.disabled = disabled
    
    // Enhance the button
    enhanceButton(button)
    
    if (loading) {
      setButtonLoading(button, true)
    }
    
    return button
  }
  
  // Show toast notification
  const showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    
    // Add toast styles if not present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style')
      style.id = 'toast-styles'
      style.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          animation: toastSlideIn 0.3s ease;
          max-width: 400px;
        }
        .toast-info { background: #2196F3; }
        .toast-success { background: #4CAF50; }
        .toast-warning { background: #FF9800; }
        .toast-error { background: #F44336; }
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
    
    document.body.appendChild(toast)
    
    // Auto-remove toast
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove()
        }
      }, 300)
    }, duration)
  }
  
  // Cleanup
  const cleanup = () => {
    loadingButtons.value.clear()
    buttonConfigs.value.clear()
  }
  
  return {
    enhanceButton,
    setButtonLoading,
    executeButtonAction,
    createModernButton,
    showToast,
    cleanup
  }
} 