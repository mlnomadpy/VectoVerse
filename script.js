import { VectorAtomicFramework } from './modules/VectorAtomicFramework.js';

let framework;

document.addEventListener('DOMContentLoaded', function() {
    try {
        framework = new VectorAtomicFramework();
        // Make framework globally accessible for onclick handlers
        window.framework = framework;
    } catch (error) {
        console.error('Failed to initialize Vectoverse:', error);
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #ff4757;">
                    <h2>⚠️ Error Loading Vectoverse</h2>
                    <p>Please refresh the page and try again.</p>
                    <p style="font-size: 0.8em; opacity: 0.7;">Error: ${error.message}</p>
                </div>
            `;
        }
    }
});