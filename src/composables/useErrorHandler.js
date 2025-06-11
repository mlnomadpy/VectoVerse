import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

export function useErrorHandler() {
  const uiStore = useUIStore()
  const errorLog = ref([])

  const setupGlobalErrorHandling = () => {
    window.addEventListener('error', (event) => {
      handleError(event.error, {
        context: 'Global JavaScript Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason, {
        context: 'Unhandled Promise Rejection'
      })
    })
  }

  const handleError = (error, context = {}) => {
    const errorInfo = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error?.message || 'An unknown error occurred.',
      stack: error?.stack || '',
      context: context,
      severity: classifyError(error)
    }

    errorLog.value.push(errorInfo)
    if (errorLog.value.length > 50) {
      errorLog.value.shift()
    }

    logErrorToConsole(errorInfo)
    
    const friendlyMessage = getFriendlyMessage(errorInfo)
    const actions = getSuggestedActions(errorInfo)

    uiStore.showError(friendlyMessage, actions)
  }

  const classifyError = (error) => {
    if (!error) return 'unknown';
    const message = (error.message || '').toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('permission') || message.includes('denied')) return 'permission';
    if (message.includes('memory') || message.includes('allocation')) return 'memory';
    if (message.includes('invalid') || message.includes('malformed')) return 'validation';
    if (message.includes('timeout')) return 'timeout';
    return 'application';
  }

  const getFriendlyMessage = (errorInfo) => {
    switch (errorInfo.severity) {
      case 'network':
        return 'A network error occurred. Please check your connection.';
      case 'permission':
        return 'Permission denied. The application may not have the required permissions to perform this action.';
      case 'memory':
        return 'The application ran out of memory. Try reducing the number of vectors or reloading.';
      case 'validation':
        return 'An invalid data format was encountered. Please check your inputs.';
      case 'timeout':
        return 'The operation timed out. Please try again.';
      default:
        return errorInfo.message || 'An unexpected error occurred.';
    }
  }

  const getSuggestedActions = (errorInfo) => {
    const actions = [];
    switch (errorInfo.severity) {
      case 'network':
        actions.push({ text: 'Retry', action: () => window.location.reload() });
        break;
      case 'memory':
        actions.push({ text: 'Reload', action: () => window.location.reload() });
        break;
      default:
        actions.push({ text: 'Reload App', action: () => window.location.reload() });
    }
    return actions;
  }

  const logErrorToConsole = (errorInfo) => {
    if (import.meta.env.DEV) {
      console.group(`🚨 VectoVerse Error: ${errorInfo.id}`);
      console.error('Message:', errorInfo.message);
      console.log('Severity:', errorInfo.severity);
      console.log('Context:', errorInfo.context);
      console.log('Timestamp:', errorInfo.timestamp);
      console.log('Stack Trace:', errorInfo.stack);
      console.groupEnd();
    }
  }
  
  const wrapAsync = async (fn, context = {}) => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, context);
      // Re-throw so the caller knows it failed.
      throw error;
    }
  }

  onMounted(() => {
    setupGlobalErrorHandling()
  })

  onUnmounted(() => {
    // In a real SPA, you might want to remove the listeners,
    // but for this app, they can live for the lifetime of the page.
  })

  return {
    errorLog,
    handleError,
    wrapAsync,
  }
} 