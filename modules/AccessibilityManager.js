// Accessibility Manager for VectoVerse
export class AccessibilityManager {
    constructor(framework) {
        this.framework = framework;
        this.announcements = [];
        this.setupAccessibility();
    }

    setupAccessibility() {
        this.createAriaLiveRegion();
        this.setupKeyboardShortcuts();
        this.setupFocusManagement();
        this.setupHighContrastMode();
        this.setupScreenReaderSupport();
    }

    createAriaLiveRegion() {
        // Create live region for screen reader announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'vectoverse-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        document.body.appendChild(liveRegion);
    }

    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('vectoverse-announcements');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Log announcement for debugging
            this.announcements.push({
                message,
                priority,
                timestamp: new Date().toISOString()
            });
            
            // Clear after announcement to allow for repeated messages
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Handle keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'g':
                        e.preventDefault();
                        this.framework.stateManager.generateVectors();
                        this.announce('Generated new vectors');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.framework.stateManager.reset();
                        this.announce('Reset visualization');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.showExportOptions();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.showAnalysisModal();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showHelp();
                        break;
                }
            } else {
                switch (e.key) {
                    case '?':
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                    case 'Escape':
                        this.closeAllModals();
                        break;
                    case 'Tab':
                        this.manageFocus(e);
                        break;
                }
            }
        });
    }

    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('focusin', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                this.trapFocusInModal(modal, e);
            }
        });

        // Focus indicators
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('vector-atom')) {
                this.announceVectorFocus(e.target);
            }
        });
    }

    trapFocusInModal(modal, event) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && event.target === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && event.target === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    announceVectorFocus(vectorElement) {
        const vectorId = vectorElement.getAttribute('data-id');
        const state = this.framework.getState();
        const vector = state.vectors.find(v => v.id.toString() === vectorId);
        
        if (vector) {
            const forceCalculator = this.framework.getModules().forceCalculator;
            const magnitude = forceCalculator.magnitude(vector).toFixed(2);
            const message = `Vector ${vector.id + 1} selected. Magnitude: ${magnitude}. ${vector.components.length} dimensions.`;
            this.announce(message);
        }
    }

    setupHighContrastMode() {
        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
            this.announce('High contrast mode detected');
        }

        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.matches);
            this.announce(e.matches ? 'High contrast mode enabled' : 'High contrast mode disabled');
        });
    }

    setupScreenReaderSupport() {
        // Add descriptive labels to visualization
        this.updateVisualizationDescription();
        
        // Listen for state changes to update descriptions
        this.framework.eventBus.on('stateChanged', () => {
            this.updateVisualizationDescription();
        });

        this.framework.eventBus.on('vectorSelected', (vectorId) => {
            this.announceVectorSelection(vectorId);
        });

        this.framework.eventBus.on('analysisCompleted', (result) => {
            this.announceAnalysisCompletion(result);
        });
    }

    updateVisualizationDescription() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        const svg = document.querySelector('#main-viz');
        
        if (svg) {
            const description = `Vector visualization with ${state.vectors.length} vectors in ${config.dimensions} dimensions. Use arrow keys to navigate between vectors, Enter to select, and ? for keyboard shortcuts.`;
            svg.setAttribute('aria-label', description);
        }
    }

    announceVectorSelection(vectorId) {
        const state = this.framework.getState();
        const vector = state.vectors.find(v => v.id === vectorId);
        
        if (vector) {
            const message = `Selected vector ${vector.id + 1}`;
            this.announce(message);
        }
    }

    announceAnalysisCompletion(result) {
        let message = `${result.type.toUpperCase()} analysis completed.`;
        
        if (result.type === 'kmeans') {
            message += ` Found ${result.data.k} clusters.`;
        } else if (result.type === 'pca') {
            const variance = (result.explainedVariance.reduce((sum, v) => sum + v, 0) * 100).toFixed(1);
            message += ` ${variance}% variance explained.`;
        }
        
        this.announce(message);
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl+G', action: 'Generate new vectors' },
            { key: 'Ctrl+R', action: 'Reset visualization' },
            { key: 'Ctrl+E', action: 'Export data' },
            { key: 'Ctrl+A', action: 'Open analysis modal' },
            { key: 'Ctrl+H', action: 'Show help' },
            { key: 'Arrow Keys', action: 'Navigate between vectors' },
            { key: 'Enter/Space', action: 'Select vector' },
            { key: 'Escape', action: 'Close modals' },
            { key: '?', action: 'Show this help' }
        ];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Keyboard Shortcuts');
        
        modal.innerHTML = `
            <div class="modal-content shortcuts-modal">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <kbd class="shortcut-key">${shortcut.key}</kbd>
                            <span class="shortcut-action">${shortcut.action}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-compact btn-primary close-shortcuts" autofocus>Close</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-shortcuts').focus();

        modal.querySelector('.close-shortcuts').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        this.announce('Keyboard shortcuts dialog opened');
    }

    showExportOptions() {
        const exportButton = document.querySelector('[data-action="export"]');
        if (exportButton) {
            exportButton.click();
            this.announce('Export options opened');
        }
    }

    showAnalysisModal() {
        const analysisButton = document.getElementById('run-analysis');
        if (analysisButton) {
            analysisButton.click();
            this.announce('Analysis modal opened');
        }
    }

    showHelp() {
        const helpButton = document.querySelector('[data-action="help"]');
        if (helpButton) {
            helpButton.click();
            this.announce('Help modal opened');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
        this.announce('All modals closed');
    }

    manageFocus(event) {
        // Ensure focus is visible and logical
        const focusedElement = event.target;
        
        if (focusedElement.classList.contains('vector-atom')) {
            // Ensure vector is visible in viewport
            focusedElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center'
            });
        }
    }

    addAriaLabelsToControls() {
        // Add comprehensive ARIA labels to all controls
        const controls = {
            '#dimensions-slider': 'Number of dimensions',
            '#num-vectors-slider': 'Number of vectors',
            '#regenerate': 'Generate new random vectors',
            '#toggle-forces': 'Toggle force visualization',
            '#run-analysis': 'Open analysis modal',
            '#file-upload': 'Upload vector data file',
            '.theme-switcher': 'Switch between light and dark theme'
        };

        Object.entries(controls).forEach(([selector, label]) => {
            const element = document.querySelector(selector);
            if (element && !element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', label);
            }
        });
    }

    ensureColorContrast() {
        // Check and warn about color contrast issues
        const elements = document.querySelectorAll('button, .btn');
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const backgroundColor = styles.backgroundColor;
            const color = styles.color;
            
            // This is a simplified check - in production, use a proper contrast ratio calculator
            if (backgroundColor === 'transparent' || color === backgroundColor) {
                console.warn('Potential contrast issue detected', element);
            }
        });
    }

    getAccessibilityReport() {
        return {
            announcements: this.announcements,
            focusableElements: document.querySelectorAll('[tabindex], button, input, select, textarea, a[href]').length,
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            highContrastMode: document.body.classList.contains('high-contrast'),
            screenReaderSupport: {
                liveRegion: !!document.getElementById('vectoverse-announcements'),
                landmarks: document.querySelectorAll('[role]').length,
                headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
            }
        };
    }

    // Initialize accessibility features
    initialize() {
        this.addAriaLabelsToControls();
        this.ensureColorContrast();
        this.announce('VectoVerse visualization loaded. Press ? for keyboard shortcuts.');
    }
} 