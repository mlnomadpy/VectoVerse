/**
 * KeyboardShortcuts - Manages keyboard shortcut handling for the application
 * Provides keyboard-based interactions when no modal is open
 */
export class KeyboardShortcuts {
    /**
     * Initialize KeyboardShortcuts with framework reference
     * @param {Object} framework - The main VectorAtomicFramework instance
     */
    constructor(framework) {
        this.framework = framework;
    }

    /**
     * Initialize keyboard event listeners
     * Sets up document-level keydown listener
     */
    initialize() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    /**
     * Handle keyboard press events
     * Prevents shortcuts from firing when modals are open
     * @param {KeyboardEvent} event - The keyboard event
     * 
     * Supported shortcuts:
     * - Space: Generate new vectors
     * - F: Toggle force visualization
     * - I: Add input vector
     */
    handleKeyPress(event) {
        // No modals are open
        if (!document.querySelector('.input-editor-modal')) {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.framework.stateManager.generateVectors();
                    break;
                case 'KeyF':
                    event.preventDefault();
                    this.framework.updateConfig('showForces', !this.framework.getConfig().showForces);
                    break;
                case 'KeyI':
                    event.preventDefault();
                    this.framework.addInputVector();
                    break;
            }
        }
    }
} 