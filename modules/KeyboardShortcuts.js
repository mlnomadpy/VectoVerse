export class KeyboardShortcuts {
    constructor(framework) {
        this.framework = framework;
    }

    initialize() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

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