// Enhanced UI Components for VectoVerse
export class ButtonManager {
    constructor(framework) {
        this.framework = framework;
        this.buttons = new Map();
        this.init();
    }

    init() {
        this.createButtonStyles();
        this.enhanceExistingButtons();
        this.addNewButtons();
        this.createFloatingActionButton();
    }    createButtonStyles() {
        // Inject modern button styles
        const style = document.createElement('style');
        style.textContent = `
            .btn-modern {
                position: relative;
                padding: 12px 24px;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                text-transform: none;
                box-shadow: 0 4px 14px 0 rgba(0,0,0,.1);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: 2px solid transparent;
                min-width: 120px;
                justify-content: center;
                outline: none;
                font-family: inherit;
            }

            /* Ripple effect */
            .btn-modern::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255,255,255,0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
                z-index: 0;
                pointer-events: none;
            }

            .btn-modern:active::before {
                width: 300px;
                height: 300px;
                transition: width 0.2s, height 0.2s;
            }

            .btn-modern:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            }

            .btn-modern:active {
                transform: translateY(0);
                box-shadow: 0 4px 14px 0 rgba(0,0,0,.1);
            }

            .btn-modern:focus {
                outline: 2px solid #667eea;
                outline-offset: 2px;
            }

            /* Loading state */
            .btn-modern.loading {
                pointer-events: none;
                opacity: 0.7;
                position: relative;
            }

            .btn-modern.loading::after {
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

            /* Button variants */
            .btn-primary { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            }
            .btn-primary:hover { 
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); 
            }

            .btn-success { 
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); 
            }
            .btn-success:hover { 
                background: linear-gradient(135deg, #44a08d 0%, #4ecdc4 100%); 
            }

            .btn-warning { 
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); 
                color: #333; 
            }
            .btn-warning:hover { 
                background: linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%); 
            }

            .btn-danger { 
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
            }
            .btn-danger:hover { 
                background: linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%); 
            }

            .btn-info { 
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); 
            }
            .btn-info:hover { 
                background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%); 
            }

            .btn-secondary { 
                background: linear-gradient(135deg, #636e72 0%, #2d3436 100%); 
            }
            .btn-secondary:hover { 
                background: linear-gradient(135deg, #2d3436 0%, #636e72 100%); 
            }

            /* Icon animations */
            .btn-modern .icon {
                transition: transform 0.3s ease;
                display: inline-block;
            }

            .btn-modern:hover .icon {
                transform: scale(1.1);
            }

            /* Floating Action Button */
            .fab-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 1000;
            }

            .fab-main {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                outline: none;
            }

            .fab-main:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }

            .fab-main:focus {
                outline: 2px solid #667eea;
                outline-offset: 2px;
            }

            .fab-menu {
                position: absolute;
                bottom: 70px;
                right: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
                opacity: 0;
                transform: scale(0);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
            }

            .fab-container.open .fab-menu {
                opacity: 1;
                transform: scale(1);
                pointer-events: all;
            }

            .fab-item {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                outline: none;
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            }

            .fab-item:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            .fab-item:focus {
                outline: 2px solid #4ecdc4;
                outline-offset: 2px;
            }

            /* Enhanced tooltips */
            .btn-tooltip {
                position: relative;
            }

            .btn-tooltip::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 110%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                z-index: 1000;
                font-weight: normal;
            }

            .btn-tooltip:hover::after {
                opacity: 1;
            }

            /* Accessibility improvements */
            @media (prefers-reduced-motion: reduce) {
                .btn-modern,
                .fab-main,
                .fab-item {
                    transition: none !important;
                }
                
                .btn-modern::before {
                    display: none !important;
                }
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .btn-modern {
                    border: 2px solid currentColor;
                    background: transparent !important;
                    color: inherit;
                }
            }

            .btn-modern.btn-primary {
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            }

            .btn-modern.btn-secondary {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .btn-modern.btn-success {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            .btn-modern.btn-warning {
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                color: #333;
            }

            .btn-modern.btn-danger {
                background: linear-gradient(135deg, #ff8a80 0%, #ff5722 100%);
            }

            .btn-modern.btn-icon-only {
                min-width: 48px;
                width: 48px;
                height: 48px;
                padding: 12px;
                border-radius: 50%;
            }

            .btn-modern .btn-icon {
                width: 18px;
                height: 18px;
                fill: currentColor;
            }

            .btn-modern:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }

            .btn-modern.loading {
                pointer-events: none;
            }

            .btn-modern.loading::after {
                content: '';
                position: absolute;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .btn-group {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                align-items: center;
            }

            .btn-toolbar {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                padding: 12px;
                margin: 8px 0;
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
                border: 1px solid rgba(255,255,255,0.2);
            }

            body.light-theme .btn-toolbar {
                background: rgba(255,255,255,0.9);
                border: 1px solid rgba(0,0,0,0.1);
            }
        `;
        
        // Prevent duplicate styles
        const existingStyle = document.querySelector('#button-manager-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        style.id = 'button-manager-styles';
        document.head.appendChild(style);
    }

        enhanceExistingButtons() {
        // Enhance existing buttons without disrupting the compact design
        const buttonConfigs = [
            { selector: '#regenerate', type: 'primary', icon: 'refresh-cw', text: 'Generate Vectors' },
            { selector: '#toggle-forces', type: 'secondary', icon: 'zap', text: 'Toggle Forces' },
            { selector: '#add-input-vector', type: 'success', icon: 'plus', text: 'Add Test Vector' },
            { selector: '#export-json', type: 'warning', icon: 'download', text: 'Export Data' },
            { selector: '#show-help', type: 'info', icon: 'help-circle', text: 'Help' }
        ];

        buttonConfigs.forEach(config => {
            const btn = document.querySelector(config.selector);
            if (btn) {
                // Just add enhanced interactions, keep existing styling
                this.addButtonInteractions(btn, config);
            }
        });
    }

    addButtonInteractions(button, config) {
        // Add enhanced click handling with ripple effect
        const originalHandler = button.onclick;
        button.onclick = (event) => {
            this.createRippleEffect(button, event);
            if (originalHandler) {
                originalHandler.call(button, event);
            }
        };

        // Add ARIA attributes for accessibility
        button.setAttribute('aria-label', config.text);
        
        // Add loading state capability
        this.buttons.set(config.selector, button);
    }enhanceButton(button, config) {
        // Add modern styling
        button.className = `btn-modern btn-${config.type} btn-tooltip`;
        
        // Add tooltip
        button.setAttribute('data-tooltip', config.tooltip || config.text);
        
        // Add ARIA attributes for accessibility
        button.setAttribute('aria-label', config.text);
        if (config.description) {
            button.setAttribute('aria-describedby', `${config.selector.replace('#', '')}-desc`);
        }
        
        // Clear existing content
        button.innerHTML = '';
          // Add icon with proper spacing
        if (config.icon) {
            const icon = this.createIcon(config.icon);
            icon.setAttribute('class', icon.getAttribute('class') + ' icon');
            button.appendChild(icon);
        }
        
        // Add text
        const textSpan = document.createElement('span');
        textSpan.textContent = config.text;
        button.appendChild(textSpan);

        // Add click handler for enhanced feedback
        const originalHandler = button.onclick;
        button.onclick = (e) => {
            this.handleButtonClick(button, config, originalHandler, e);
        };

        // Store reference
        this.buttons.set(config.selector, {
            element: button,
            config: config,
            originalHandler: originalHandler
        });
    }    handleButtonClick(button, config, originalHandler, event) {
        // Add loading state
        if (config.async) {
            this.setButtonLoading(button, true);
        }

        // Add ripple effect
        this.createRippleEffect(button, event);

        // Execute original handler
        if (originalHandler) {
            const result = originalHandler.call(button, event);
            
            // Handle async operations
            if (result && typeof result.then === 'function') {
                result.finally(() => {
                    if (config.async) {
                        this.setButtonLoading(button, false);
                    }
                });
            } else if (config.async) {
                // If not actually async, remove loading state after brief delay
                setTimeout(() => this.setButtonLoading(button, false), 500);
            }
        }
    }

    createRippleEffect(button, event) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255,255,255,0.3);
            pointer-events: none;
            transform: scale(0);
            transition: transform 0.6s ease-out;
            z-index: 1;
        `;

        button.appendChild(ripple);
        
        // Trigger animation
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(2)';
        });

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.setAttribute('aria-busy', 'false');
        }
    }    addNewButtons() {
        // Check if we have the modern controls topbar structure
        const controlsContainer = document.querySelector('.controls-topbar') || document.querySelector('.controls');
        
        if (!controlsContainer) {
            console.warn('No controls container found. Skipping additional buttons.');
            return;
        }

        // For now, just enhance existing buttons without adding new toolbars
        // The compact topbar design already provides all necessary controls
        console.log('ButtonManager: Using existing compact controls structure');
        
        // Setup event listeners for any additional functionality
        this.setupNewButtonListeners();
    }

    createToolbar(title, buttons) {
        const toolbar = document.createElement('div');
        toolbar.className = 'btn-toolbar';
        
        const titleEl = document.createElement('span');
        titleEl.textContent = title;
        titleEl.style.fontWeight = '600';
        titleEl.style.marginRight = '12px';
        titleEl.style.color = 'rgba(255,255,255,0.9)';
        toolbar.appendChild(titleEl);

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group';

        buttons.forEach(config => {
            const btn = document.createElement('button');
            btn.id = config.id;
            btn.className = `btn-modern btn-${config.type}`;
            
            const icon = this.createIcon(config.icon);
            btn.appendChild(icon);
            btn.appendChild(document.createTextNode(config.text));
            
            buttonGroup.appendChild(btn);
            this.buttons.set(`#${config.id}`, btn);
        });

        toolbar.appendChild(buttonGroup);
        return toolbar;
    }

    createIcon(iconName) {
        const iconMap = {
            'refresh-cw': 'M23 4v6h-6M1 20v-6h6m16-4a9 9 0 0 1-9 9H8a9 9 0 0 1-9-9m18 0a9 9 0 0 0-9-9H8a9 9 0 0 0-9 9',
            'zap': 'm13 2l-4 8h6l-4 8',
            'plus': 'M12 5v14m-7-7h14',
            'download': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
            'help-circle': 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
            'target': 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
            'shuffle': 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6m-6-10.5L7.5 7',
            'move': 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3',
            'box': 'M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.78 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z',
            'share-2': 'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
            'grid': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
            'layers': 'M12 2l8 4-8 4-8-4 8-4zM2 12l8 4 8-4M2 17l8 4 8-4',
            'trending-up': 'M23 6l-9.5 9.5-5-5L1 18'
        };

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'btn-icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', iconMap[iconName] || 'M12 12h.01');
        
        svg.appendChild(path);
        return svg;
    }    setupNewButtonListeners() {
        // For now, just setup enhanced interactions for existing buttons
        // Additional functionality can be added through the existing compact buttons
        console.log('ButtonManager: Enhanced interactions ready for compact controls');
        
        // Setup keyboard shortcuts if needed
        this.setupKeyboardShortcuts();
    }
    
    setupKeyboardShortcuts() {
        // Add some useful keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'g':
                        e.preventDefault();
                        document.querySelector('#regenerate')?.click();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.querySelector('#toggle-forces')?.click();
                        break;
                    case 'h':
                        e.preventDefault();
                        document.querySelector('#show-help')?.click();
                        break;
                }
            }
        });
    }

    addButtonListener(selector, callback) {
        const button = this.buttons.get(selector) || document.querySelector(selector);
        if (button) {
            button.addEventListener('click', callback);
        }
    }

    setButtonLoading(selector, loading) {
        const button = this.buttons.get(selector) || document.querySelector(selector);
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const typeColors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${typeColors[type] || typeColors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        `;

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Floating Action Button System
    createFloatingActionButton() {
        // Create main FAB
        const fab = document.createElement('div');
        fab.className = 'fab-main';
        fab.setAttribute('role', 'button');
        fab.setAttribute('tabindex', '0');
        fab.setAttribute('aria-label', 'Quick Actions');
        
        const icon = this.createIcon('plus');
        fab.appendChild(icon);
        
        // Create FAB menu
        const fabMenu = document.createElement('div');
        fabMenu.className = 'fab-menu';
        
        const fabActions = [
            { icon: 'plus', label: 'Add Vector', action: 'addVector' },
            { icon: 'refresh-cw', label: 'Randomize', action: 'randomize' },
            { icon: 'download', label: 'Export', action: 'export' },
            { icon: 'zap', label: 'Animate', action: 'animate' }
        ];
        
        fabActions.forEach((action, index) => {
            const fabItem = document.createElement('div');
            fabItem.className = 'fab-item';
            fabItem.setAttribute('role', 'button');
            fabItem.setAttribute('tabindex', '0');
            fabItem.setAttribute('aria-label', action.label);
            
            const actionIcon = this.createIcon(action.icon);
            fabItem.appendChild(actionIcon);
            
            // Add tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'fab-tooltip';
            tooltip.textContent = action.label;
            fabItem.appendChild(tooltip);
            
            // Add click handler
            fabItem.addEventListener('click', () => this.handleFabAction(action.action));
            
            fabMenu.appendChild(fabItem);
        });
        
        fab.appendChild(fabMenu);
        
        // Toggle menu
        fab.addEventListener('click', () => this.toggleFabMenu(fab));
        
        // Keyboard support
        fab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleFabMenu(fab);
            }
        });
        
        document.body.appendChild(fab);
        this.fab = fab;
    }
    
    toggleFabMenu(fab) {
        const isOpen = fab.classList.contains('fab-open');
        if (isOpen) {
            fab.classList.remove('fab-open');
            fab.setAttribute('aria-expanded', 'false');
        } else {
            fab.classList.add('fab-open');
            fab.setAttribute('aria-expanded', 'true');
        }
    }
    
    handleFabAction(action) {
        switch (action) {
            case 'addVector':
                this.framework.getModules().stateManager.addVector();
                this.showToast('Vector added!', 'success');
                break;
            case 'randomize':
                this.framework.getModules().stateManager.generateVectors();
                this.showToast('Vectors randomized!', 'success');
                break;
            case 'export':
                this.exportData();
                break;
            case 'animate':
                this.toggleAnimation();
                break;
        }
        
        // Close FAB menu after action
        if (this.fab) {
            this.fab.classList.remove('fab-open');
        }
    }
    
    exportData() {
        try {
            const state = this.framework.getState();
            const data = {
                vectors: state.vectors,
                config: this.framework.getConfig(),
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `vectorverse-export-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.', 'error');
        }
    }
    
    toggleAnimation() {
        const state = this.framework.getState();
        state.isAnimating = !state.isAnimating;
        
        if (state.isAnimating) {
            this.startAnimation();
            this.showToast('Animation started!', 'success');
        } else {
            this.stopAnimation();
            this.showToast('Animation stopped!', 'info');
        }
    }
    
    startAnimation() {
        if (this.animationId) return;
        
        const animate = () => {
            const state = this.framework.getState();
            if (!state.isAnimating) return;
            
            // Simple rotation animation
            state.vectors.forEach((vector, index) => {
                const time = Date.now() * 0.001;
                const offset = index * 0.5;
                vector.angle = (time + offset) % (2 * Math.PI);
            });
            
            this.framework.notify('stateChanged');
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Accessibility enhancements
    enhanceAccessibility() {
        // Add keyboard navigation for all buttons
        this.buttons.forEach((buttonInfo, selector) => {
            const button = buttonInfo.element;
            
            // Ensure proper focus handling
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
            
            // Add focus indicators
            button.addEventListener('focus', () => {
                button.classList.add('focused');
            });
            
            button.addEventListener('blur', () => {
                button.classList.remove('focused');
            });
        });
        
        // Add screen reader announcements
        this.addScreenReaderSupport();
    }
    
    addScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }
    
    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
    
    // Cleanup method
    destroy() {
        // Remove all event listeners and DOM elements
        this.buttons.forEach((buttonInfo) => {
            const button = buttonInfo.element;
            if (button && button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
        
        if (this.fab && this.fab.parentNode) {
            this.fab.parentNode.removeChild(this.fab);
        }
        
        if (this.liveRegion && this.liveRegion.parentNode) {
            this.liveRegion.parentNode.removeChild(this.liveRegion);
        }
        
        this.stopAnimation();
        this.buttons.clear();
    }
}
