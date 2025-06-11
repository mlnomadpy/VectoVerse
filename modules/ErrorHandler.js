// Comprehensive Error Handler for VectoVerse
export class ErrorHandler {
    constructor(framework) {
        this.framework = framework;
        this.errorLog = [];
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                context: 'Global JavaScript Error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                context: 'Unhandled Promise Rejection'
            });
        });
    }

    handleError(error, context = {}) {
        const errorInfo = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            message: error?.message || 'Unknown error',
            stack: error?.stack || '',
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            severity: this.classifyError(error)
        };

        this.errorLog.push(errorInfo);
        this.displayUserFriendlyError(errorInfo);
        this.logError(errorInfo);

        // Attempt recovery for certain types of errors
        this.attemptRecovery(errorInfo);
    }

    classifyError(error) {
        if (!error) return 'unknown';
        
        const message = error.message?.toLowerCase() || '';
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('permission') || message.includes('denied')) {
            return 'permission';
        } else if (message.includes('memory') || message.includes('allocation')) {
            return 'memory';
        } else if (message.includes('invalid') || message.includes('malformed')) {
            return 'validation';
        } else if (message.includes('timeout')) {
            return 'timeout';
        } else {
            return 'application';
        }
    }

    displayUserFriendlyError(errorInfo) {
        const friendlyMessage = this.getFriendlyMessage(errorInfo);
        const actions = this.getSuggestedActions(errorInfo);

        // Show user-friendly error notification
        this.showErrorNotification(friendlyMessage, actions, errorInfo.severity);
    }

    getFriendlyMessage(errorInfo) {
        switch (errorInfo.severity) {
            case 'network':
                return 'Network connection issue. Please check your internet connection and try again.';
            case 'permission':
                return 'Permission denied. Please check browser permissions for file access.';
            case 'memory':
                return 'Not enough memory to complete this operation. Try reducing the number of vectors or dimensions.';
            case 'validation':
                return 'Invalid data detected. Please check your input and try again.';
            case 'timeout':
                return 'Operation timed out. The request is taking too long to complete.';
            default:
                return 'An unexpected error occurred. The application will attempt to recover automatically.';
        }
    }

    getSuggestedActions(errorInfo) {
        const actions = [];
        
        switch (errorInfo.severity) {
            case 'network':
                actions.push({ text: 'Retry', action: () => window.location.reload() });
                break;
            case 'memory':
                actions.push({ 
                    text: 'Reduce Vectors', 
                    action: () => this.framework.stateManager.reduceVectorCount() 
                });
                actions.push({ 
                    text: 'Reset', 
                    action: () => this.framework.stateManager.reset() 
                });
                break;
            case 'validation':
                actions.push({ 
                    text: 'Reset Data', 
                    action: () => this.framework.stateManager.generateVectors() 
                });
                break;
            default:
                actions.push({ text: 'Reload App', action: () => window.location.reload() });
        }

        return actions;
    }

    showErrorNotification(message, actions, severity) {
        // Remove existing error notifications
        document.querySelectorAll('.error-notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `error-notification error-${severity}`;
        notification.innerHTML = `
            <div class="error-content">
                <div class="error-icon">${this.getErrorIcon(severity)}</div>
                <div class="error-text">
                    <strong>Oops! Something went wrong</strong>
                    <p>${message}</p>
                </div>
                <button class="error-close" aria-label="Close">&times;</button>
            </div>
            ${actions.length > 0 ? `
                <div class="error-actions">
                    ${actions.map(action => `
                        <button class="btn-compact error-action" data-action="${action.text}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        document.body.appendChild(notification);

        // Set up event listeners
        notification.querySelector('.error-close').onclick = () => notification.remove();
        
        actions.forEach(action => {
            const button = notification.querySelector(`[data-action="${action.text}"]`);
            if (button) {
                button.onclick = () => {
                    action.action();
                    notification.remove();
                };
            }
        });

        // Auto-remove after 10 seconds for non-critical errors
        if (severity !== 'memory' && severity !== 'permission') {
            setTimeout(() => {
                if (notification.parentNode) notification.remove();
            }, 10000);
        }
    }

    getErrorIcon(severity) {
        switch (severity) {
            case 'network': return '🌐';
            case 'permission': return '🔒';
            case 'memory': return '💾';
            case 'validation': return '⚠️';
            case 'timeout': return '⏱️';
            default: return '⚠️';
        }
    }

    attemptRecovery(errorInfo) {
        switch (errorInfo.severity) {
            case 'memory':
                // Automatically reduce complexity
                const config = this.framework.getConfig();
                if (config.numVectors > 20) {
                    this.framework.updateConfig('numVectors', Math.max(10, config.numVectors / 2));
                    this.framework.stateManager.generateVectors();
                }
                break;
            case 'validation':
                // Reset to safe defaults
                this.framework.stateManager.generateVectors();
                break;
        }
    }

    generateErrorId() {
        return 'err_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    logError(errorInfo) {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 VectoVerse Error');
            console.error('Message:', errorInfo.message);
            console.error('Context:', errorInfo.context);
            console.error('Stack:', errorInfo.stack);
            console.error('Severity:', errorInfo.severity);
            console.groupEnd();
        }

        // Store in localStorage for debugging
        try {
            const storedErrors = JSON.parse(localStorage.getItem('vectoverse-errors') || '[]');
            storedErrors.push(errorInfo);
            
            // Keep only last 50 errors
            if (storedErrors.length > 50) {
                storedErrors.splice(0, storedErrors.length - 50);
            }
            
            localStorage.setItem('vectoverse-errors', JSON.stringify(storedErrors));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    getErrorReport() {
        return {
            errors: this.errorLog,
            systemInfo: this.getSystemInfo(),
            timestamp: new Date().toISOString()
        };
    }

    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown'
        };
    }

    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('vectoverse-errors');
    }

    // Utility methods for module-specific error handling
    wrapAsyncOperation(operation, context) {
        return async (...args) => {
            try {
                return await operation(...args);
            } catch (error) {
                this.handleError(error, { context, args });
                throw error; // Re-throw for caller to handle if needed
            }
        };
    }

    validateInput(value, validator, errorMessage) {
        try {
            if (!validator(value)) {
                throw new Error(errorMessage);
            }
            return true;
        } catch (error) {
            this.handleError(error, { context: 'Input Validation', value });
            return false;
        }
    }
} 