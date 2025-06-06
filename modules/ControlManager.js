// Enhanced Control Management System for VectoVerse
// Unified, modular, and innovative control interface

export class ControlManager {
    constructor(framework) {
        this.framework = framework;
        this.d3 = window.d3;
        this.controls = new Map();
        this.controlGroups = new Map();
        this.activePresets = new Set();
        this.controlHistory = [];
        this.maxHistory = 50;
        
        // Control configuration registry
        this.controlRegistry = {
            // Primary controls
            dimensions: {
                type: 'range',
                min: 2,
                max: 20,
                value: 4,
                step: 1,
                icon: '📐',
                label: 'Dimensions',
                tooltip: 'Number of Dimensions (2-20)',
                category: 'primary',
                realtime: true,
                validate: (value) => value >= 2 && value <= 20,
                format: (value) => `${value}D`,
                onChange: (value) => this.framework.updateConfig('dimensions', value)
            },
            
            numVectors: {
                type: 'range',
                min: 2,
                max: 12,
                value: 6,
                step: 1,
                icon: '🎯',
                label: 'Vectors',
                tooltip: 'Number of Vectors (2-12)',
                category: 'primary',
                realtime: true,
                validate: (value) => value >= 2 && value <= 12,
                format: (value) => `${value}`,
                onChange: (value) => this.framework.updateConfig('numVectors', value)
            },
            
            // Visualization controls
            showForces: {
                type: 'toggle',
                value: false,
                icon: '⚡',
                label: 'Forces',
                tooltip: 'Toggle Force Visualization',
                category: 'visualization',
                states: ['OFF', 'ON'],
                colors: ['secondary', 'accent'],
                onChange: (value) => this.framework.updateConfig('showForces', value)
            },
            
            animationSpeed: {
                type: 'range',
                min: 0.1,
                max: 3.0,
                value: 1.0,
                step: 0.1,
                icon: '🏃',
                label: 'Speed',
                tooltip: 'Animation Speed (0.1x - 3.0x)',
                category: 'animation',
                realtime: true,
                format: (value) => `${value.toFixed(1)}x`,
                onChange: (value) => this.framework.updateConfig('animationSpeed', value)
            },
            
            forceStrength: {
                type: 'range',
                min: 0.1,
                max: 5.0,
                value: 1.0,
                step: 0.1,
                icon: '💪',
                label: 'Force',
                tooltip: 'Force Visualization Strength',
                category: 'visualization',
                realtime: true,
                format: (value) => `${value.toFixed(1)}x`,
                onChange: (value) => this.framework.updateConfig('forceStrength', value)
            },
            
            // Advanced controls
            resonanceThreshold: {
                type: 'range',
                min: 0.0,
                max: 1.0,
                value: 0.1,
                step: 0.01,
                icon: '🌊',
                label: 'Resonance',
                tooltip: 'Resonance Detection Threshold',
                category: 'advanced',
                realtime: true,
                format: (value) => value.toFixed(2),
                onChange: (value) => this.framework.updateConfig('resonanceThreshold', value)
            },
            
            // Display controls
            colorScheme: {
                type: 'select',
                value: 'default',
                icon: '🎨',
                label: 'Colors',
                tooltip: 'Color Scheme',
                category: 'display',
                options: [
                    { value: 'default', label: 'Default' },
                    { value: 'neon', label: 'Neon' },
                    { value: 'pastel', label: 'Pastel' },
                    { value: 'monochrome', label: 'Monochrome' },
                    { value: 'scientific', label: 'Scientific' }
                ],
                onChange: (value) => this.framework.updateConfig('colorScheme', value)
            },
            
            renderQuality: {
                type: 'select',
                value: 'high',
                icon: '⚙️',
                label: 'Quality',
                tooltip: 'Render Quality',
                category: 'performance',
                options: [
                    { value: 'low', label: 'Low (Fast)' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High (Detailed)' },
                    { value: 'ultra', label: 'Ultra (Slow)' }
                ],
                onChange: (value) => this.framework.updateConfig('renderQuality', value)
            }
        };
        
        // Control presets for quick switching
        this.presets = {
            performance: {
                name: 'Performance',
                icon: '🚀',
                description: 'Optimized for speed',
                settings: {
                    renderQuality: 'low',
                    animationSpeed: 2.0,
                    showForces: false,
                    dimensions: 3,
                    numVectors: 4
                }
            },
            
            detailed: {
                name: 'Detailed',
                icon: '🔬',
                description: 'Maximum detail and analysis',
                settings: {
                    renderQuality: 'ultra',
                    animationSpeed: 0.5,
                    showForces: true,
                    forceStrength: 2.0,
                    resonanceThreshold: 0.05
                }
            },
            
            presentation: {
                name: 'Presentation',
                icon: '📊',
                description: 'Beautiful for demos',
                settings: {
                    renderQuality: 'high',
                    animationSpeed: 1.0,
                    showForces: true,
                    colorScheme: 'neon',
                    dimensions: 4,
                    numVectors: 6
                }
            },
            
            research: {
                name: 'Research',
                icon: '🧪',
                description: 'High-dimensional analysis',
                settings: {
                    dimensions: 12,
                    numVectors: 8,
                    showForces: true,
                    resonanceThreshold: 0.01,
                    colorScheme: 'scientific'
                }
            }
        };
        
        this.init();
    }
      init() {
        this.createControlInterface();
        this.setupEventListeners();
        this.createControlHistory();
        this.setupKeyboardShortcuts();
        
        // Add resize handler
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupEventListeners() {
        // Topbar collapse button
        const topbar = this.d3.select('.controls-topbar');
        if (!topbar.empty()) {
            const collapseBtn = topbar.select('.collapse-toggle');
            if (!collapseBtn.empty()) {
                let isCollapsed = false;
                collapseBtn.on('click', () => {
                    isCollapsed = !isCollapsed;
                    const controlsContent = topbar.selectAll('.controls-left, .controls-center, .controls-right');
                    if (isCollapsed) {
                        controlsContent.style('display', 'none');
                        topbar.style('min-height', '24px');
                        collapseBtn.html('⌄');
                    } else {
                        controlsContent.style('display', 'flex');
                        topbar.style('min-height', '48px');
                        collapseBtn.html('⌃');
                    }
                });
                collapseBtn.on('mouseenter', () => {
                    collapseBtn.style('opacity', '1');
                }).on('mouseleave', () => {
                    collapseBtn.style('opacity', '0.7');
                });
            }
        }

        // Expandable panel expand/collapse button
        const expandButton = this.d3.select('.expand-controls');
        if (!expandButton.empty()) {
            expandButton.on('click', () => this.toggleExpandedControls());
            expandButton.on('mouseenter', function() {
                this.d3.select(this).style('transform', 'scale(1.1)');
            }).on('mouseleave', function() {
                this.d3.select(this).style('transform', 'scale(1)');
            });
        }
    }
    
    createControlInterface() {
        // Enhance existing topbar
        this.enhanceTopbarControls();
        
        // Create expandable control panels
        this.createExpandablePanels();
        
        // Create quick access toolbar
        this.createQuickAccessToolbar();
        
        // Create contextual controls
        this.createContextualControls();
    }
    
    enhanceTopbarControls() {
        const topbar = this.d3.select('.controls-topbar');
        
        // Add control category indicators
        topbar.selectAll('.control-compact')
            .each((d, i, nodes) => {
                const control = this.d3.select(nodes[i]);
                const controlId = control.select('input').attr('id');
                const config = this.controlRegistry[controlId];
                
                if (config) {
                    // Add category indicator
                    control.classed(`control-${config.category}`, true);
                    
                    // Enhanced with real-time feedback
                    if (config.realtime) {
                        this.setupRealtimeControl(control, config);
                    }
                    
                    // Add validation feedback
                    this.addValidationFeedback(control, config);
                }
            });
        
        // Add collapsible sections
        // Event listeners are now in setupEventListeners
    }
    
    setupRealtimeControl(control, config) {
        const input = control.select('input');
        const valueDisplay = control.select('.control-value');
        
        // Create live preview indicator
        const liveIndicator = control.append('div')
            .attr('class', 'live-indicator')
            .style('position', 'absolute')
            .style('top', '-2px')
            .style('right', '-2px')
            .style('width', '6px')
            .style('height', '6px')
            .style('background', '#00ff88')
            .style('border-radius', '50%')
            .style('opacity', '0')
            .style('transition', 'opacity 0.2s ease');
        
        let debounceTimer;
        
        input.on('input', (event) => {
            const value = config.type === 'range' ? +event.target.value : event.target.value;
            
            // Show live indicator
            liveIndicator.style('opacity', '1');
            
            // Update display immediately
            if (valueDisplay.node() && config.format) {
                valueDisplay.text(config.format(value));
            }
            
            // Debounce the actual change
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (config.validate(value)) {
                    config.onChange(value);
                    this.addToHistory(config.label, value);
                }
                liveIndicator.style('opacity', '0');
            }, config.realtime ? 100 : 300);
        });
    }
    
    addValidationFeedback(control, config) {
        const input = control.select('input');
        
        // Add validation indicator
        const validator = control.append('div')
            .attr('class', 'validation-indicator')
            .style('position', 'absolute')
            .style('bottom', '-2px')
            .style('left', '50%')
            .style('transform', 'translateX(-50%)')
            .style('width', '20px')
            .style('height', '2px')
            .style('background', '#00ff88')
            .style('border-radius', '1px')
            .style('transition', 'background-color 0.3s ease');
        
        input.on('input', (event) => {
            const value = config.type === 'range' ? +event.target.value : event.target.value;
            const isValid = config.validate(value);
            
            validator.style('background', isValid ? '#00ff88' : '#ff4757');
        });
    }
    
    createExpandablePanels() {
        const container = this.d3.select('.container');
        
        // Create expandable control panel
        const controlPanel = container.insert('div', '.controls-topbar + *')
            .attr('class', 'expandable-controls')
            .style('margin-bottom', '10px')
            .style('transition', 'all 0.3s ease')
            .style('max-height', '0')
            .style('overflow', 'hidden')
            .style('background', 'rgba(255,255,255,0.05)')
            .style('border-radius', '8px')
            .style('backdrop-filter', 'blur(10px)');
        
        // Add expand/collapse button to topbar
        const expandButton = this.d3.select('.controls-center .btn-group')
            .insert('button', ':first-child')
            .attr('class', 'btn-compact btn-utility expand-controls')
            .attr('data-tooltip', 'Advanced Controls')
            .style('transition', 'transform 0.3s ease');
        
        expandButton.append('span')
            .attr('class', 'btn-icon')
            .text('⚙️');
        
        // Event listeners are now in setupEventListeners
    }
    
    populateExpandedControls(panel) {
        panel.html(''); // Clear existing content
        
        // Create categorized control sections
        const categories = this.groupControlsByCategory();
        
        const grid = panel.append('div')
            .attr('class', 'advanced-controls-grid')
            .style('display', 'grid')
            .style('grid-template-columns', 'repeat(auto-fit, minmax(250px, 1fr))')
            .style('gap', '15px');
        
        Object.entries(categories).forEach(([category, controls]) => {
            if (category === 'primary') return; // Skip primary controls (already in topbar)
            
            const section = grid.append('div')
                .attr('class', `control-section control-section-${category}`)
                .style('background', 'rgba(255,255,255,0.05)')
                .style('border-radius', '6px')
                .style('padding', '12px')
                .style('border', '1px solid rgba(255,255,255,0.1)');
            
            section.append('h4')
                .attr('class', 'section-title')
                .style('margin', '0 0 10px 0')
                .style('font-size', '0.9em')
                .style('color', '#ffd700')
                .style('text-transform', 'capitalize')
                .text(category);
            
            controls.forEach(control => {
                this.createAdvancedControl(section, control);
            });
        });
        
        // Add preset section
        this.createPresetSection(grid);
    }
    
    groupControlsByCategory() {
        const categories = {};
        
        Object.entries(this.controlRegistry).forEach(([key, config]) => {
            if (!categories[config.category]) {
                categories[config.category] = [];
            }
            categories[config.category].push({ key, ...config });
        });
        
        return categories;
    }
    
    createAdvancedControl(container, control) {
        const controlDiv = container.append('div')
            .attr('class', `advanced-control advanced-control-${control.type}`)
            .style('margin-bottom', '10px');
        
        // Label with icon
        const label = controlDiv.append('div')
            .attr('class', 'control-label')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '5px')
            .style('margin-bottom', '5px')
            .style('font-size', '0.8em');
        
        label.append('span').text(control.icon);
        label.append('span').text(control.label);
        
        // Control input based on type
        switch (control.type) {
            case 'range':
                this.createRangeControl(controlDiv, control);
                break;
            case 'select':
                this.createSelectControl(controlDiv, control);
                break;
            case 'toggle':
                this.createToggleControl(controlDiv, control);
                break;
        }
    }
    
    createRangeControl(container, control) {
        const wrapper = container.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '8px');
        
        const input = wrapper.append('input')
            .attr('type', 'range')
            .attr('id', `advanced-${control.key}`)
            .attr('min', control.min)
            .attr('max', control.max)
            .attr('step', control.step)
            .attr('value', control.value)
            .style('flex', '1')
            .style('height', '4px')
            .style('background', 'linear-gradient(to right, #4ecdc4 0%, rgba(255,255,255,0.2) 0%)')
            .style('border-radius', '2px')
            .style('outline', 'none')
            .style('-webkit-appearance', 'none')
            .style('appearance', 'none');
        
        const valueDisplay = wrapper.append('span')
            .attr('class', 'advanced-control-value')
            .style('min-width', '60px')
            .style('text-align', 'right')
            .style('font-size', '0.8em')
            .style('color', '#ffd700')
            .text(control.format ? control.format(control.value) : control.value);
        
        // Enhanced styling for webkit slider thumb
        this.styleRangeInput(input);
        
        // Event handling
        input.on('input', (event) => {
            const value = +event.target.value;
            valueDisplay.text(control.format ? control.format(value) : value);
            
            // Update gradient
            const percentage = ((value - control.min) / (control.max - control.min)) * 100;
            input.style('background', 
                `linear-gradient(to right, #4ecdc4 ${percentage}%, rgba(255,255,255,0.2) ${percentage}%)`);
            
            if (control.validate(value)) {
                control.onChange(value);
                this.addToHistory(control.label, value);
            }
        });
        
        // Initialize gradient
        const initialPercentage = ((control.value - control.min) / (control.max - control.min)) * 100;
        input.style('background', 
            `linear-gradient(to right, #4ecdc4 ${initialPercentage}%, rgba(255,255,255,0.2) ${initialPercentage}%)`);
    }
    
    createSelectControl(container, control) {
        const select = container.append('select')
            .attr('id', `advanced-${control.key}`)
            .style('width', '100%')
            .style('padding', '6px 10px')
            .style('background', 'rgba(255,255,255,0.1)')
            .style('color', 'white')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .style('border-radius', '4px')
            .style('font-size', '0.8em')
            .style('cursor', 'pointer');
        
        control.options.forEach(option => {
            const optionElement = select.append('option')
                .attr('value', option.value)
                .text(option.label)
                .style('background', '#2c3e50')
                .style('color', 'white');
            
            if (option.value === control.value) {
                optionElement.attr('selected', true);
            }
        });
        
        select.on('change', (event) => {
            const value = event.target.value;
            control.onChange(value);
            this.addToHistory(control.label, value);
        });
    }
    
    createToggleControl(container, control) {
        const toggle = container.append('button')
            .attr('class', `toggle-control ${control.value ? 'active' : ''}`)
            .attr('id', `advanced-${control.key}`)
            .style('width', '100%')
            .style('padding', '8px 12px')
            .style('background', control.value ? '#4ecdc4' : 'rgba(255,255,255,0.1)')
            .style('color', 'white')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .style('border-radius', '4px')
            .style('cursor', 'pointer')
            .style('transition', 'all 0.3s ease')
            .style('font-size', '0.8em');
        
        const updateToggle = (active) => {
            toggle
                .style('background', active ? '#4ecdc4' : 'rgba(255,255,255,0.1)')
                .text(active ? control.states[1] : control.states[0])
                .classed('active', active);
        };
        
        updateToggle(control.value);
        
        toggle.on('click', () => {
            const newValue = !control.value;
            control.value = newValue;
            updateToggle(newValue);
            control.onChange(newValue);
            this.addToHistory(control.label, newValue ? 'ON' : 'OFF');
        });
    }
    
    createPresetSection(grid) {
        const presetSection = grid.append('div')
            .attr('class', 'preset-section')
            .style('background', 'rgba(255,215,0,0.1)')
            .style('border-radius', '6px')
            .style('padding', '12px')
            .style('border', '1px solid rgba(255,215,0,0.3)');
        
        presetSection.append('h4')
            .style('margin', '0 0 10px 0')
            .style('font-size', '0.9em')
            .style('color', '#ffd700')
            .text('🎛️ Presets');
        
        const presetGrid = presetSection.append('div')
            .style('display', 'grid')
            .style('grid-template-columns', '1fr 1fr')
            .style('gap', '8px');
        
        Object.entries(this.presets).forEach(([key, preset]) => {
            const presetButton = presetGrid.append('button')
                .attr('class', 'preset-button')
                .style('padding', '8px')
                .style('background', 'rgba(255,255,255,0.1)')
                .style('color', 'white')
                .style('border', '1px solid rgba(255,255,255,0.2)')
                .style('border-radius', '4px')
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease')
                .style('font-size', '0.7em')
                .style('text-align', 'center');
            
            presetButton.append('div')
                .style('font-size', '1.2em')
                .text(preset.icon);
            
            presetButton.append('div')
                .style('font-weight', 'bold')
                .text(preset.name);
            
            presetButton.on('click', () => {
                this.applyPreset(key);
                this.highlightPresetButton(presetButton);
            });
        });
    }
    
    applyPreset(presetKey) {
        const preset = this.presets[presetKey];
        if (!preset) return;
        
        // Apply all settings in the preset
        Object.entries(preset.settings).forEach(([key, value]) => {
            const control = this.controlRegistry[key];
            if (control) {
                control.onChange(value);
                this.updateControlDisplay(key, value);
            }
        });
        
        this.addToHistory('Preset', preset.name);
        this.framework.eventBus.emit('presetApplied', { preset: presetKey, settings: preset.settings });
    }
    
    updateControlDisplay(controlKey, value) {
        // Update topbar control if exists
        const topbarInput = this.d3.select(`#${controlKey}`);
        if (!topbarInput.empty()) {
            topbarInput.property('value', value);
            
            const valueDisplay = this.d3.select(`#${controlKey.replace('num', '').replace('Vectors', 'vec')}-value`);
            if (!valueDisplay.empty()) {
                const config = this.controlRegistry[controlKey];
                valueDisplay.text(config.format ? config.format(value) : value);
            }
        }
        
        // Update advanced control if exists
        const advancedInput = this.d3.select(`#advanced-${controlKey}`);
        if (!advancedInput.empty()) {
            advancedInput.property('value', value);
            
            // Update associated value display
            const container = advancedInput.node().parentElement;
            const valueDisplay = this.d3.select(container).select('.advanced-control-value');
            if (!valueDisplay.empty()) {
                const config = this.controlRegistry[controlKey];
                valueDisplay.text(config.format ? config.format(value) : value);
            }
        }
    }
    
    highlightPresetButton(button) {
        // Remove previous highlights
        this.d3.selectAll('.preset-button').style('border-color', 'rgba(255,255,255,0.2)');
        
        // Highlight selected
        button.style('border-color', '#ffd700')
            .style('box-shadow', '0 0 10px rgba(255,215,0,0.3)');
        
        // Auto-remove highlight after 2 seconds
        setTimeout(() => {
            button.style('border-color', 'rgba(255,255,255,0.2)')
                .style('box-shadow', 'none');
        }, 2000);
    }
    
    createQuickAccessToolbar() {
        // Add floating quick access controls for frequent actions
        const quickAccess = this.d3.select('body').append('div')
            .attr('class', 'quick-access-toolbar')
            .style('position', 'fixed')
            .style('right', '20px')
            .style('top', '50%')
            .style('transform', 'translateY(-50%)')
            .style('z-index', '1000')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('border-radius', '25px')
            .style('padding', '10px 5px')
            .style('backdrop-filter', 'blur(10px)')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .style('opacity', '0.7')
            .style('transition', 'opacity 0.3s ease');
        
        quickAccess.on('mouseenter', () => quickAccess.style('opacity', '1'))
                  .on('mouseleave', () => quickAccess.style('opacity', '0.7'));
        
        const quickControls = [
            { icon: '🎲', action: () => this.framework.stateManager.generateVectors(), tooltip: 'Generate New Vectors' },
            { icon: '⚡', action: () => this.toggleForces(), tooltip: 'Toggle Forces' },
            { icon: '🎨', action: () => this.cycleColorScheme(), tooltip: 'Cycle Color Scheme' },
            { icon: '📏', action: () => this.showDimensionPicker(), tooltip: 'Quick Dimension Change' },
            { icon: '⏯️', action: () => this.toggleAnimation(), tooltip: 'Pause/Resume Animation' }
        ];
        
        quickControls.forEach((control, index) => {
            const button = quickAccess.append('div')
                .attr('class', 'quick-control-button')
                .style('width', '40px')
                .style('height', '40px')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('justify-content', 'center')
                .style('cursor', 'pointer')
                .style('border-radius', '50%')
                .style('margin', '5px 0')
                .style('background', 'rgba(255,255,255,0.1)')
                .style('transition', 'all 0.3s ease')
                .style('font-size', '1.2em')
                .text(control.icon)
                .attr('data-tooltip', control.tooltip);
            
            button.on('click', control.action)
                  .on('mouseenter', function() {
                      button.style('background', 'rgba(255,255,255,0.2)')
                            .style('transform', 'scale(1.1)');
                  })
                  .on('mouseleave', function() {
                      button.style('background', 'rgba(255,255,255,0.1)')
                            .style('transform', 'scale(1)');
                  });
        });
    }
    
    createContextualControls() {
        // Controls that appear based on current state/selection
        this.framework.eventBus.on('vectorSelected', (data) => {
            this.showVectorContextControls(data.vector);
        });
        
        this.framework.eventBus.on('inputVectorAdded', () => {
            this.showInputVectorControls();
        });
        
        this.framework.eventBus.on('stateChanged', () => {
            this.updateContextualControls();
        });
    }
    
    updateContextualControls() {
        // This method can be expanded to update various contextual UI elements
        // For now, it will ensure that any visible contextual controls are refreshed
        // based on the current state.

        // Example: If a vector is selected, re-render its contextual controls
        const selectedVector = this.framework.stateManager.getSelectedVector();
        if (selectedVector) {
            this.showVectorContextControls(selectedVector);
        } else {
            // If no vector is selected, we could hide any open vector context menus
            this.d3.select('.vector-context-controls').remove();
        }
    }
    
    showVectorContextControls(vector) {
        // Remove existing context controls
        this.d3.select('.vector-context-controls').remove();
        
        const contextControls = this.d3.select('body').append('div')
            .attr('class', 'vector-context-controls')
            .style('position', 'fixed')
            .style('left', '20px')
            .style('bottom', '20px')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('border-radius', '10px')
            .style('padding', '15px')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .style('backdrop-filter', 'blur(10px)')
            .style('z-index', '1000')
            .style('min-width', '200px');
        
        contextControls.append('h4')
            .style('margin', '0 0 10px 0')
            .style('color', '#ffd700')
            .style('font-size', '0.9em')
            .text(`Vector ${vector.id + 1} Controls`);
        
        // Vector-specific controls
        this.addVectorScaleControl(contextControls, vector);
        this.addVectorColorControl(contextControls, vector);
        this.addVectorManipulationControls(contextControls, vector);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            contextControls.style('opacity', '0');
            setTimeout(() => contextControls.remove(), 300);
        }, 10000);
    }
    
    addVectorScaleControl(container, vector) {
        const scaleControl = container.append('div')
            .style('margin-bottom', '10px');
        
        scaleControl.append('label')
            .style('display', 'block')
            .style('font-size', '0.8em')
            .style('margin-bottom', '5px')
            .text('📏 Scale');
        
        const scaleInput = scaleControl.append('input')
            .attr('type', 'range')
            .attr('min', '0.5')
            .attr('max', '3.0')
            .attr('step', '0.1')
            .attr('value', '1.0')
            .style('width', '100%');
        
        scaleInput.on('input', (event) => {
            const scale = +event.target.value;
            this.framework.setVectorScale(vector.id, scale);
        });
    }

    addVectorColorControl(container, vector) {
        const colorControl = container.append('div')
            .style('margin-bottom', '10px');

        colorControl.append('label')
            .style('display', 'block')
            .style('font-size', '0.8em')
            .style('margin-bottom', '5px')
            .text('🎨 Custom Color');

        const colorInput = colorControl.append('input')
            .attr('type', 'color')
            .attr('value', vector.customColor || '#ffffff')
            .style('width', '100%');

        colorInput.on('input', (event) => {
            this.framework.stateManager.setVectorCustomColor(vector.id, event.target.value);
        });
    }

    addVectorManipulationControls(container, vector) {
        const manipulationControl = container.append('div')
            .style('margin-top', '10px');
            
        const removeButton = manipulationControl.append('button')
            .style('width', '100%')
            .style('padding', '8px')
            .style('background', '#ff4757')
            .style('color', 'white')
            .style('border', 'none')
            .style('border-radius', '5px')
            .style('cursor', 'pointer')
            .text('Remove Vector');
            
        removeButton.on('click', () => {
            this.framework.stateManager.removeVector(vector.id);
            this.d3.select('.vector-context-controls').remove();
        });
    }
    
    createControlHistory() {
        this.historyPanel = this.d3.select('body').append('div')
            .attr('class', 'control-history-panel')
            .style('position', 'fixed')
            .style('left', '-300px')
            .style('top', '20px')
            .style('width', '280px')
            .style('height', 'calc(100vh - 40px)')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('border-radius', '0 10px 10px 0')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .style('backdrop-filter', 'blur(10px)')
            .style('z-index', '999')
            .style('transition', 'left 0.3s ease')
            .style('overflow-y', 'auto');
        
        // History toggle button
        const historyToggle = this.d3.select('body').append('div')
            .attr('class', 'history-toggle')
            .style('position', 'fixed')
            .style('left', '10px')
            .style('top', '50%')
            .style('transform', 'translateY(-50%)')
            .style('width', '30px')
            .style('height', '60px')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('border-radius', '0 15px 15px 0')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('cursor', 'pointer')
            .style('z-index', '1001')
            .style('border', '1px solid rgba(255,255,255,0.2)')
            .text('📋');
        
        let historyVisible = false;
        
        historyToggle.on('click', () => {
            historyVisible = !historyVisible;
            this.historyPanel.style('left', historyVisible ? '0px' : '-300px');
            historyToggle.text(historyVisible ? '❌' : '📋');
        });
        
        this.initializeHistoryPanel();
    }
    
    initializeHistoryPanel() {
        this.historyPanel.append('h3')
            .style('margin', '15px')
            .style('color', '#ffd700')
            .style('font-size', '1em')
            .text('📋 Control History');
        
        this.historyContent = this.historyPanel.append('div')
            .attr('class', 'history-content')
            .style('padding', '0 15px');
        
        this.historyPanel.append('div')
            .attr('class', 'history-actions')
            .style('position', 'absolute')
            .style('bottom', '15px')
            .style('left', '15px')
            .style('right', '15px');
        
        const clearButton = this.historyPanel.select('.history-actions')
            .append('button')
            .style('width', '100%')
            .style('padding', '8px')
            .style('background', '#ff4757')
            .style('color', 'white')
            .style('border', 'none')
            .style('border-radius', '5px')
            .style('cursor', 'pointer')
            .text('Clear History');
        
        clearButton.on('click', () => {
            this.controlHistory = [];
            this.updateHistoryDisplay();
        });
    }
    
    addToHistory(control, value) {
        const entry = {
            timestamp: Date.now(),
            control: control,
            value: value
        };
        
        this.controlHistory.unshift(entry);
        
        if (this.controlHistory.length > this.maxHistory) {
            this.controlHistory = this.controlHistory.slice(0, this.maxHistory);
        }
        
        // Emit history change event
        this.framework.eventBus.emit('controlHistoryChanged', {
            history: this.controlHistory,
            latest: entry
        });
    }
    
    getControlHistory() {
        return [...this.controlHistory];
    }
    
    undoLastChange() {
        if (this.controlHistory.length < 2) return false;
        
        const previous = this.controlHistory[1]; // Skip the current (most recent) entry
        const config = this.controlRegistry[previous.control];
        
        if (config && config.onChange) {
            config.onChange(previous.value);
            return true;
        }
        
        return false;
    }
    
    resetToDefaults() {
        Object.entries(this.controlRegistry).forEach(([key, config]) => {
            if (config.onChange && config.value !== undefined) {
                config.onChange(config.value);
            }
        });
        
        this.controlHistory = [];
        this.framework.eventBus.emit('controlsReset');
    }

    showDimensionPicker() {
        // Simple prompt for now, can be enhanced with a modal
        const currentDims = this.framework.getConfig().dimensions;
        const newDims = prompt(`Enter new number of dimensions (current: ${currentDims}):`, currentDims);
        
        if (newDims !== null && !isNaN(newDims) && newDims > 0) {
            const dims = parseInt(newDims, 10);
            this.framework.updateConfig('dimensions', dims);
            this.framework.stateManager.generateVectors();
            this.framework.getModules().uiController.showToast(`Dimensions set to ${dims}`, 'success');
        }
    }

    styleRangeInput(input) {
        // Add custom CSS for webkit slider thumb
        const style = document.createElement('style');
        style.textContent = `
            .advanced-control input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #4ecdc4;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .advanced-control input[type="range"]::-webkit-slider-thumb:hover {
                background: #45b7b8;
                transform: scale(1.2);
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            }
            
            .advanced-control input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #4ecdc4;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        `;
        
        if (!document.querySelector('#control-manager-styles')) {
            style.id = 'control-manager-styles';
            document.head.appendChild(style);
        }
    }
    
    // Utility methods for quick actions
    toggleForces() {
        const currentState = this.framework.getConfig().showForces;
        this.framework.updateConfig('showForces', !currentState);
        this.updateControlDisplay('showForces', !currentState);
    }
    
    cycleColorScheme() {
        const schemes = ['default', 'neon', 'pastel', 'monochrome', 'scientific'];
        const current = this.framework.getConfig().colorScheme || 'default';
        const currentIndex = schemes.indexOf(current);
        const nextIndex = (currentIndex + 1) % schemes.length;
        const nextScheme = schemes[nextIndex];
        
        this.framework.updateConfig('colorScheme', nextScheme);
        this.updateControlDisplay('colorScheme', nextScheme);
        this.addToHistory('Color Scheme', nextScheme);
    }
    
    cyclePreset() {
        const presetKeys = Object.keys(this.presets);
        const currentIndex = this.currentPresetIndex || 0;
        const nextIndex = (currentIndex + 1) % presetKeys.length;
        const nextPreset = presetKeys[nextIndex];
        
        this.applyPreset(nextPreset);
        this.currentPresetIndex = nextIndex;
    }
    
    incrementControl(controlKey, delta) {
        const control = this.controlRegistry[controlKey];
        if (!control) return;
        
        const currentValue = this.framework.getConfig()[controlKey];
        const newValue = Math.max(control.min, Math.min(control.max, currentValue + delta));
        
        control.onChange(newValue);
        this.updateControlDisplay(controlKey, newValue);
        this.addToHistory(control.label, control.format ? control.format(newValue) : newValue);
    }
    
    resetAllControls() {
        Object.entries(this.controlRegistry).forEach(([key, control]) => {
            control.onChange(control.value);
            this.updateControlDisplay(key, control.value);
        });
        
        this.addToHistory('System', 'Reset All Controls');
    }
    
    toggleExpandedControls() {
        const expandButton = this.d3.select('.expand-controls');
        if (!expandButton.empty()) {
            expandButton.dispatch('click');
        }
    }
    
    handleResize() {
        // Adjust layout based on screen size
        const isSmallScreen = window.innerWidth < 768;
        
        this.d3.select('.quick-access-toolbar')
            .style('display', isSmallScreen ? 'none' : 'block');
        
        this.d3.select('.expandable-controls')
            .style('max-height', isSmallScreen ? '200px' : '300px');
    }
    
    // Public API methods
    getControlValue(controlKey) {
        return this.framework.getConfig()[controlKey];
    }
    
    setControlValue(controlKey, value) {
        const control = this.controlRegistry[controlKey];
        if (control && control.validate(value)) {
            control.onChange(value);
            this.updateControlDisplay(controlKey, value);
            this.addToHistory(control.label, control.format ? control.format(value) : value);
        }
    }
    
    registerCustomControl(key, config) {
        this.controlRegistry[key] = {
            validate: () => true,
            format: (value) => value,
            category: 'custom',
            ...config
        };
    }
    
    destroy() {
        // Cleanup
        this.d3.select('.expandable-controls').remove();
        this.d3.select('.quick-access-toolbar').remove();
        this.d3.select('.control-history-panel').remove();
        this.d3.select('.history-toggle').remove();
        this.d3.select('.vector-context-controls').remove();
        this.d3.select('#control-manager-styles').remove();
        
        // Remove event listeners
        this.d3.select('body').on('keydown.controlManager', null);
        window.removeEventListener('resize', this.handleResize);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable) {
                return; // Ignore shortcuts when typing in inputs
            }

            // Use key property for modern browsers, fall back to keyCode for older ones
            const key = e.key || e.keyCode;

            switch(key) {
                case 'r': // 'r' for Regenerate vectors
                case 82:
                    this.framework.stateManager.generateVectors();
                    this.framework.getModules().uiController.showToast('Vectors regenerated', 'info');
                    break;
                case 'f': // 'f' to toggle forces
                case 70:
                    this.toggleForces();
                    this.framework.getModules().uiController.showToast(`Forces ${this.framework.config.showForces ? 'enabled' : 'disabled'}`, 'info');
                    break;
                case 'c': // 'c' to cycle color scheme
                case 67:
                    this.cycleColorScheme();
                    break;
                case 'p': // 'p' to cycle preset
                case 80:
                    this.cyclePreset();
                    break;
                case 'h': // 'h' to toggle history panel
                case 72:
                    // Assuming history panel has a toggle method or is managed by UI controller
                    this.framework.ui.toggleHistoryPanel();
                    break;
                case 'Escape': // 'Escape' to close modals or contextual menus
                case 27:
                    this.framework.ui.closeAllPopups();
                    break;
                case '+': // '+' to increase vector count
                case '=':
                case 187:
                    this.incrementControl('numVectors', 1);
                    break;
                case '-': // '-' to decrease vector count
                case 189:
                    this.incrementControl('numVectors', -1);
                    break;
            }
        });
    }

    toggleAnimation() {
        const animationEngine = this.framework.getModules().animationEngine;
        if (animationEngine.isRunning) {
            animationEngine.stop();
            this.framework.getModules().uiController.showToast('Animation paused', 'info');
        } else {
            animationEngine.start();
            this.framework.getModules().uiController.showToast('Animation resumed', 'info');
        }
    }
}
