/**
 * Vector Analysis Studio - Enhanced Vector Analysis Module
 * Provides comprehensive vector analysis with improved UX/UI and modular architecture
 */

export class VectorAnalysisStudio {
    constructor(framework) {
        this.framework = framework;
        this.state = {
            selectedVector: null,
            currentView: 'overview',
            activeTab: 'individual',
            activeIndividualTab: 'components',
            isInitialized: false,
            clustering: {
                method: 'kmeans',
                numClusters: 3,
                results: null
            },
            relationships: {
                metric: 'cosine',
                threshold: 0.5,
                matrix: null
            }
        };
        
        // Module components for better organization
        this.components = {
            tabs: null,
            charts: null,
            statistics: null,
            clustering: null,
            relationships: null,
            patterns: null
        };

        // DOM element cache for performance
        this.elements = new Map();
        
        // Event handlers bound to this instance
        this.boundHandlers = {
            onVectorsUpdated: this.onVectorsUpdated.bind(this),
            onVectorSelected: this.onVectorSelected.bind(this),
            onVectorDeselected: this.onVectorDeselected.bind(this)
        };
        
        this.initializeEventListeners();
        this.deferredInitialize();
    }

    /**
     * Initialize event listeners for framework events
     */
    initializeEventListeners() {
        try {
            this.framework.eventBus.on('vectorsGenerated', this.boundHandlers.onVectorsUpdated);
            this.framework.eventBus.on('vectorSelected', this.boundHandlers.onVectorSelected);
            this.framework.eventBus.on('vectorDeselected', this.boundHandlers.onVectorDeselected);
        } catch (error) {
            console.error('Failed to initialize event listeners:', error);
        }
    }

    /**
     * Deferred initialization to ensure DOM and modules are ready
     */
    deferredInitialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            // Use requestAnimationFrame to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                setTimeout(() => this.initialize(), 100); // Small delay for module readiness
            });
        }
    }

    /**
     * Main initialization method
     */
    async initialize() {
        if (this.state.isInitialized) return;
        
        try {
            // Cache frequently used DOM elements
            this.cacheElements();
            
            // Initialize components in order
            await this.initializeComponents();
            
            // Setup UI event handlers
            this.setupUIEventHandlers();
            
            // Initialize tabs system
            this.initializeTabSystem();
            
            // Update initial state
            this.updateOverviewStats();
            this.updateVectorSelector();
            
            this.state.isInitialized = true;
            console.log('VectorAnalysisStudio initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize VectorAnalysisStudio:', error);
        }
    }

    /**
     * Cache frequently accessed DOM elements for performance
     */
    cacheElements() {
        const elementIds = [
            'analysis-content',
            'analysis-overview',
            'analysis-detailed',
            'vector-select',
            'vector-analysis-content',
            'total-vectors',
            'vector-dimensions',
            'avg-magnitude',
            'max-similarity',
            'relationship-matrix',
            'clustering-results',
            'toggle-analysis-view',
            'compare-vectors',
            'export-analysis',
            'back-to-overview'
        ];

        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            }
        });
    }

    /**
     * Initialize all component modules
     */
    async initializeComponents() {
        try {
            this.components.tabs = new TabManager(this);
            this.components.charts = new ChartManager(this);
            this.components.statistics = new StatisticsManager(this);
            this.components.clustering = new ClusteringManager(this);
            this.components.relationships = new RelationshipManager(this);
            this.components.patterns = new PatternManager(this);
            
            // Initialize each component
            for (const [name, component] of Object.entries(this.components)) {
                if (component && typeof component.initialize === 'function') {
                    await component.initialize();
                }
            }
        } catch (error) {
            console.error('Failed to initialize components:', error);
        }
    }

    /**
     * Setup UI event handlers for main controls
     */
    setupUIEventHandlers() {
        const handlers = [
            ['toggle-analysis-view', 'click', this.toggleView.bind(this)],
            ['back-to-overview', 'click', this.showOverview.bind(this)],
            ['compare-vectors', 'click', this.compareVectors.bind(this)],
            ['export-analysis', 'click', this.exportAnalysis.bind(this)],
            ['vector-select', 'change', this.handleVectorSelection.bind(this)]
        ];

        handlers.forEach(([elementId, event, handler]) => {
            const element = this.elements.get(elementId);
            if (element) {
                element.addEventListener(event, handler);
            }
        });
    }

    /**
     * Initialize the tab system
     */
    initializeTabSystem() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab, tabButtons, tabPanels);
            });
        });
    }

    /**
     * Switch between main tabs
     */
    switchTab(targetTab, tabButtons, tabPanels) {
        try {
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
            const activePanel = document.getElementById(`${targetTab}-tab`);
            
            if (activeButton && activePanel) {
                activeButton.classList.add('active');
                activePanel.classList.add('active');
                
                this.state.activeTab = targetTab;
                this.updateTabContent();
            }
        } catch (error) {
            console.error('Failed to switch tab:', error);
        }
    }

    /**
     * Update content for the currently active tab
     */
    updateTabContent() {
        try {
            switch (this.state.activeTab) {
                case 'individual':
                    this.updateIndividualAnalysis();
                    break;
                case 'relationships':
                    this.components.relationships?.update();
                    break;
                case 'clusters':
                    this.components.clustering?.update();
                    break;
                case 'statistics':
                    this.components.statistics?.update();
                    break;
                default:
                    console.warn(`Unknown tab: ${this.state.activeTab}`);
            }
        } catch (error) {
            console.error('Failed to update tab content:', error);
        }
    }

    // Event handlers for framework events
    onVectorsUpdated() {
        try {
            this.updateOverviewStats();
            this.updateVectorSelector();
            this.updateTabContent();
        } catch (error) {
            console.error('Error handling vectors updated:', error);
        }
    }

    onVectorSelected(vector) {
        try {
            this.state.selectedVector = vector;
            this.updateVectorSelector();
            this.updateIndividualAnalysis();
            
            // Enable compare button
            const compareBtn = this.elements.get('compare-vectors');
            if (compareBtn) {
                compareBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error handling vector selection:', error);
        }
    }

    onVectorDeselected() {
        try {
            this.state.selectedVector = null;
            this.updateVectorSelector();
            
            // Disable compare button
            const compareBtn = this.elements.get('compare-vectors');
            if (compareBtn) {
                compareBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error handling vector deselection:', error);
        }
    }

    /**
     * Get framework modules safely
     */
    getModules() {
        try {
            return this.framework.getModules();
        } catch (error) {
            console.error('Failed to get modules:', error);
            return {};
        }
    }

    /**
     * Get framework state safely
     */
    getState() {
        try {
            return this.framework.getState();
        } catch (error) {
            console.error('Failed to get state:', error);
            return { vectors: [] };
        }
    }

    /**
     * Handle vector selection from dropdown
     */
    handleVectorSelection(event) {
        try {
            const vectorId = parseInt(event.target.value);
            if (vectorId) {
                const vector = this.getState().vectors.find(v => v.id === vectorId);
                if (vector) {
                    this.framework.stateManager.setSelectedVector(vector);
                }
            }
        } catch (error) {
            console.error('Error handling vector selection:', error);
        }
    }

    /**
     * Update overview statistics
     */
    updateOverviewStats() {
        try {
            const modules = this.getModules();
            const vectors = this.getState().vectors;
            
            if (!modules.forceCalculator || !vectors.length) {
                this.clearOverviewStats();
                return;
            }

            const forceCalculator = modules.forceCalculator;
            
            // Calculate statistics
            const totalVectors = vectors.length;
            const dimensions = vectors[0]?.components.length || 0;
            const avgMagnitude = vectors.reduce((sum, v) => sum + forceCalculator.magnitude(v), 0) / vectors.length;
            
            // Calculate max similarity
            let maxSimilarity = 0;
            for (let i = 0; i < vectors.length; i++) {
                for (let j = i + 1; j < vectors.length; j++) {
                    const similarity = Math.abs(forceCalculator.cosineSimilarity(vectors[i], vectors[j]));
                    maxSimilarity = Math.max(maxSimilarity, similarity);
                }
            }

            // Update UI elements
            this.updateElement('total-vectors', totalVectors.toString());
            this.updateElement('vector-dimensions', dimensions.toString());
            this.updateElement('avg-magnitude', avgMagnitude.toFixed(2));
            this.updateElement('max-similarity', maxSimilarity.toFixed(2));
            
        } catch (error) {
            console.error('Error updating overview stats:', error);
        }
    }

    /**
     * Clear overview statistics
     */
    clearOverviewStats() {
        ['total-vectors', 'vector-dimensions', 'avg-magnitude', 'max-similarity'].forEach(id => {
            this.updateElement(id, '0');
        });
    }

    /**
     * Update vector selector dropdown
     */
    updateVectorSelector() {
        try {
            const vectorSelect = this.elements.get('vector-select');
            if (!vectorSelect) return;

            const vectors = this.getState().vectors;
            const selectedId = this.state.selectedVector?.id;

            vectorSelect.innerHTML = '<option value="">Click a vector or select here...</option>';
            
            vectors.forEach(vector => {
                const option = document.createElement('option');
                option.value = vector.id;
                option.textContent = `Vector ${vector.id}`;
                if (vector.id === selectedId) {
                    option.selected = true;
                }
                vectorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error updating vector selector:', error);
        }
    }

    /**
     * Update individual analysis content
     */
    updateIndividualAnalysis() {
        try {
            const contentContainer = this.elements.get('vector-analysis-content');
            if (!contentContainer) return;

            if (!this.state.selectedVector) {
                this.showAnalysisPlaceholder(contentContainer);
                return;
            }

            const modules = this.getModules();
            if (!modules.forceCalculator) {
                this.showError(contentContainer, 'Force calculator not available');
                return;
            }

            this.renderIndividualAnalysis(contentContainer, this.state.selectedVector, modules.forceCalculator);
            
        } catch (error) {
            console.error('Error updating individual analysis:', error);
        }
    }

    /**
     * Show placeholder message for analysis
     */
    showAnalysisPlaceholder(container) {
        container.innerHTML = `
            <div class="analysis-placeholder">
                <div class="placeholder-icon">🎯</div>
                <h3>Select a Vector to Begin Analysis</h3>
                <p>Click on any vector in the visualization or use the dropdown above to start exploring detailed properties and relationships.</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(container, message) {
        container.innerHTML = `
            <div class="analysis-error">
                <div class="error-icon">⚠️</div>
                <h3>Analysis Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Render comprehensive individual analysis
     */
    renderIndividualAnalysis(container, vector, forceCalculator) {
        try {
            // Calculate basic properties
            const quantums = forceCalculator.getInformationQuantums(vector);
            const stats = this.calculateVectorStats(vector, forceCalculator);
            
            // Determine charge
            let charge = "Neutral";
            if (quantums.excitatory > quantums.inhibitory) charge = "Positive";
            else if (quantums.inhibitory > quantums.excitatory) charge = "Negative";

            const magnitude = forceCalculator.magnitude(vector);
            const entropy = forceCalculator.informationEntropy(vector);
            const sparsity = this.calculateSparsity(vector);
            
            // Render enhanced individual analysis
            container.innerHTML = this.generateIndividualAnalysisHTML(vector, {
                charge,
                magnitude,
                entropy,
                sparsity,
                quantums,
                stats
            });
            
            // Initialize enhanced analysis features
            this.setupIndividualAnalysisTabs();
            this.populateAnalysisContent(vector, forceCalculator, stats, quantums);
            
        } catch (error) {
            console.error('Error rendering individual analysis:', error);
            this.showError(container, 'Failed to render analysis');
        }
    }

    /**
     * Calculate vector statistics
     */
    calculateVectorStats(vector, forceCalculator) {
        try {
            const components = vector.components;
            const mean = components.reduce((a, b) => a + b, 0) / components.length;
            const variance = components.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / components.length;
            
            return {
                mean,
                variance,
                standardDeviation: Math.sqrt(variance),
                magnitude: forceCalculator.magnitude(vector),
                min: Math.min(...components),
                max: Math.max(...components)
            };
        } catch (error) {
            console.error('Error calculating vector stats:', error);
            return {};
        }
    }

    /**
     * Calculate sparsity ratio
     */
    calculateSparsity(vector) {
        try {
            const threshold = 0.001;
            const zeroCount = vector.components.filter(c => Math.abs(c) < threshold).length;
            return zeroCount / vector.components.length;
        } catch (error) {
            console.error('Error calculating sparsity:', error);
            return 0;
        }
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        try {
            const element = this.elements.get(id) || document.getElementById(id);
            if (element) {
                element.textContent = content;
            }
        } catch (error) {
            console.error(`Error updating element ${id}:`, error);
        }
    }

    /**
     * View toggle functionality
     */
    toggleView() {
        try {
            const toggleBtn = this.elements.get('toggle-analysis-view');
            const overview = this.elements.get('analysis-overview');
            const detailed = this.elements.get('analysis-detailed');
            
            if (!toggleBtn || !overview || !detailed) return;

            if (this.state.currentView === 'overview') {
                this.state.currentView = 'detailed';
                overview.style.display = 'none';
                detailed.style.display = 'block';
                toggleBtn.innerHTML = '<span class="btn-icon">📊</span><span class="btn-text">Overview</span>';
            } else {
                this.state.currentView = 'overview';
                overview.style.display = 'block';
                detailed.style.display = 'none';
                toggleBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Detailed View</span>';
            }
        } catch (error) {
            console.error('Error toggling view:', error);
        }
    }

    /**
     * Show overview
     */
    showOverview() {
        try {
            this.state.currentView = 'overview';
            const overview = this.elements.get('analysis-overview');
            const detailed = this.elements.get('analysis-detailed');
            const toggleBtn = this.elements.get('toggle-analysis-view');
            
            if (overview) overview.style.display = 'block';
            if (detailed) detailed.style.display = 'none';
            if (toggleBtn) {
                toggleBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Detailed View</span>';
            }
        } catch (error) {
            console.error('Error showing overview:', error);
        }
    }

    /**
     * Compare vectors functionality
     */
    compareVectors() {
        // TODO: Implement vector comparison modal/interface
        console.log('Vector comparison feature - to be implemented');
    }

    /**
     * Export analysis functionality
     */
    exportAnalysis() {
        // TODO: Implement analysis export functionality
        console.log('Analysis export feature - to be implemented');
    }

    /**
     * Generate individual analysis HTML
     */
    generateIndividualAnalysisHTML(vector, data) {
        const { charge, magnitude, entropy, sparsity } = data;
        
        return `
            <div class="vector-analysis-card">
                <div class="vector-header-enhanced">
                    <div class="vector-title-section">
                        <h4>🎯 Vector ${vector.id} Deep Analysis</h4>
                        <div class="vector-summary">
                            <span class="summary-item">
                                <span class="summary-label">Dimensionality:</span>
                                <span class="summary-value">${vector.components.length}D</span>
                            </span>
                            <span class="summary-item">
                                <span class="summary-label">Magnitude:</span>
                                <span class="summary-value">${magnitude.toFixed(4)}</span>
                            </span>
                            <span class="summary-item">
                                <span class="summary-label">Entropy:</span>
                                <span class="summary-value">${entropy.toFixed(4)}</span>
                            </span>
                        </div>
                    </div>
                    <div class="vector-badges-enhanced">
                        <span class="vector-badge charge-${charge.toLowerCase()}" title="Information Charge Type">
                            <span class="badge-icon">${charge === 'Positive' ? '⚡' : charge === 'Negative' ? '🔋' : '⚖️'}</span>
                            ${charge}
                        </span>
                        <span class="vector-badge magnitude" title="Vector Magnitude">
                            <span class="badge-icon">📏</span>
                            ${magnitude.toFixed(3)}
                        </span>
                        <span class="vector-badge sparsity" title="Component Sparsity">
                            <span class="badge-icon">💎</span>
                            ${(sparsity * 100).toFixed(1)}% sparse
                        </span>
                    </div>
                </div>
                
                <div class="analysis-tabs-enhanced">
                    <div class="tab-nav">
                        <button class="tab-nav-btn active" data-target="components">📊 Components</button>
                        <button class="tab-nav-btn" data-target="statistics">📈 Statistics</button>
                        <button class="tab-nav-btn" data-target="relationships">🔗 Relationships</button>
                        <button class="tab-nav-btn" data-target="patterns">🧩 Patterns</button>
                        <button class="tab-nav-btn" data-target="information">🧠 Information</button>
                    </div>
                    
                    <div class="tab-content-enhanced">
                        <div class="tab-pane active" id="components-pane">
                            <div class="components-analysis">
                                <div class="visualization-container">
                                    <div class="chart-header">
                                        <h6>Component Distribution Visualization</h6>
                                        <div class="chart-controls">
                                            <select id="chart-type-select" class="mini-select">
                                                <option value="bar">Bar Chart</option>
                                                <option value="line">Line Chart</option>
                                                <option value="histogram">Histogram</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="components-chart-enhanced" id="components-chart-individual"></div>
                                </div>
                                
                                <div class="components-insights">
                                    <div class="insight-grid" id="insight-grid"></div>
                                    <div class="component-extremes">
                                        <h6>🎯 Notable Components</h6>
                                        <div class="extremes-list" id="extremes-list"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="statistics-pane">
                            <div class="statistics-enhanced">
                                <div class="stats-categories" id="stats-categories"></div>
                                <div class="statistical-insights">
                                    <h6>💡 Statistical Insights</h6>
                                    <div class="insights-list" id="statistical-insights"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="relationships-pane">
                            <div class="relationships-enhanced" id="relationships-enhanced"></div>
                        </div>
                        
                        <div class="tab-pane" id="patterns-pane">
                            <div class="patterns-analysis" id="patterns-analysis"></div>
                        </div>
                        
                        <div class="tab-pane" id="information-pane">
                            <div class="information-analysis" id="information-analysis"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup individual analysis tabs
     */
    setupIndividualAnalysisTabs() {
        try {
            const tabNavBtns = document.querySelectorAll('.tab-nav-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            tabNavBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-target');
                    
                    // Update active states
                    tabNavBtns.forEach(b => b.classList.remove('active'));
                    tabPanes.forEach(p => p.classList.remove('active'));
                    
                    btn.classList.add('active');
                    const targetPane = document.getElementById(`${target}-pane`);
                    if (targetPane) {
                        targetPane.classList.add('active');
                        this.state.activeIndividualTab = target;
                    }
                });
            });

            // Setup chart type selector
            const chartTypeSelect = document.getElementById('chart-type-select');
            if (chartTypeSelect) {
                chartTypeSelect.addEventListener('change', () => {
                    if (this.state.selectedVector) {
                        this.renderSimpleChart('components-chart-individual', this.state.selectedVector.components);
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up individual analysis tabs:', error);
        }
    }

    /**
     * Populate analysis content for all tabs
     */
    populateAnalysisContent(vector, forceCalculator, stats, quantums) {
        try {
            // Components tab
            this.populateComponentsAnalysis(vector, stats);
            
            // Statistics tab  
            this.populateStatisticsAnalysis(vector, stats, forceCalculator);
            
            // Information tab
            this.populateInformationAnalysis(vector, forceCalculator, quantums);
            
            // Chart rendering
            this.renderSimpleChart('components-chart-individual', vector.components);
            
        } catch (error) {
            console.error('Error populating analysis content:', error);
        }
    }

    /**
     * Populate components analysis
     */
    populateComponentsAnalysis(vector, stats) {
        try {
            const insightGrid = document.getElementById('insight-grid');
            const extremesList = document.getElementById('extremes-list');
            
            if (insightGrid) {
                const positiveComps = vector.components.filter(c => c > 0);
                const negativeComps = vector.components.filter(c => c < 0);
                const magnitude = stats.magnitude || 0;
                const strongComponents = vector.components.filter(c => Math.abs(c) > magnitude * 0.3);
                
                insightGrid.innerHTML = `
                    <div class="insight-card positive">
                        <div class="insight-header">
                            <span class="insight-icon">⬆️</span>
                            <span class="insight-title">Positive Components</span>
                        </div>
                        <div class="insight-value">${positiveComps.length}</div>
                        <div class="insight-detail">Avg: ${positiveComps.length > 0 ? (positiveComps.reduce((a, b) => a + b, 0) / positiveComps.length).toFixed(3) : '0.000'}</div>
                    </div>
                    <div class="insight-card negative">
                        <div class="insight-header">
                            <span class="insight-icon">⬇️</span>
                            <span class="insight-title">Negative Components</span>
                        </div>
                        <div class="insight-value">${negativeComps.length}</div>
                        <div class="insight-detail">Avg: ${negativeComps.length > 0 ? (negativeComps.reduce((a, b) => a + b, 0) / negativeComps.length).toFixed(3) : '0.000'}</div>
                    </div>
                    <div class="insight-card dominant">
                        <div class="insight-header">
                            <span class="insight-icon">💪</span>
                            <span class="insight-title">Strong Components</span>
                        </div>
                        <div class="insight-value">${strongComponents.length}</div>
                        <div class="insight-detail">> 30% of magnitude</div>
                    </div>
                `;
            }
            
            if (extremesList) {
                const componentsWithIndex = vector.components.map((value, index) => ({ value, index }));
                const sortedByAbs = [...componentsWithIndex].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
                
                extremesList.innerHTML = `
                    <div class="extreme-category">
                        <div class="extreme-header">
                            <span class="extreme-icon">🔝</span>
                            <span class="extreme-title">Highest Components</span>
                        </div>
                        <div class="extreme-items">
                            ${sortedByAbs.slice(0, 3).map(item => `
                                <div class="extreme-item">
                                    <span class="extreme-index">dim ${item.index + 1}</span>
                                    <span class="extreme-value ${item.value >= 0 ? 'positive' : 'negative'}">${item.value.toFixed(4)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error populating components analysis:', error);
        }
    }

    /**
     * Populate statistics analysis
     */
    populateStatisticsAnalysis(vector, stats, forceCalculator) {
        try {
            const statsCategories = document.getElementById('stats-categories');
            const statisticalInsights = document.getElementById('statistical-insights');
            
            if (statsCategories) {
                statsCategories.innerHTML = `
                    <div class="stats-category">
                        <h6>📊 Basic Statistics</h6>
                        <div class="stats-detailed">
                            <div class="stat-row enhanced">
                                <span class="stat-name">Mean:</span>
                                <span class="stat-value">${stats.mean?.toFixed(4) || '0.0000'}</span>
                            </div>
                            <div class="stat-row enhanced">
                                <span class="stat-name">Standard Deviation:</span>
                                <span class="stat-value">${stats.standardDeviation?.toFixed(4) || '0.0000'}</span>
                            </div>
                            <div class="stat-row enhanced">
                                <span class="stat-name">Min Value:</span>
                                <span class="stat-value">${stats.min?.toFixed(4) || '0.0000'}</span>
                            </div>
                            <div class="stat-row enhanced">
                                <span class="stat-name">Max Value:</span>
                                <span class="stat-value">${stats.max?.toFixed(4) || '0.0000'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            if (statisticalInsights) {
                const insights = this.generateStatisticalInsights(vector, stats);
                statisticalInsights.innerHTML = insights.map(insight => `
                    <div class="insight-item">
                        <span class="insight-indicator">${insight.icon}</span>
                        <span class="insight-text">${insight.text}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error populating statistics analysis:', error);
        }
    }

    /**
     * Generate statistical insights
     */
    generateStatisticalInsights(vector, stats) {
        const insights = [];
        const magnitude = stats.magnitude || 0;
        
        if (magnitude > 2) {
            insights.push({
                icon: '⚡',
                text: `High magnitude vector (${magnitude.toFixed(2)}) indicates strong signal strength`
            });
        } else if (magnitude < 0.5) {
            insights.push({
                icon: '🔋',
                text: `Low magnitude vector (${magnitude.toFixed(2)}) indicates weak signal strength`
            });
        }
        
        const sparsity = this.calculateSparsity(vector);
        if (sparsity > 0.7) {
            insights.push({
                icon: '💎',
                text: `Highly sparse vector (${(sparsity * 100).toFixed(1)}% zeros) - efficient representation`
            });
        }
        
        return insights;
    }

    /**
     * Populate information analysis tab
     */
    populateInformationAnalysis(vector, forceCalculator, quantums) {
        try {
            const container = document.getElementById('information-analysis');
            if (!container) return;

            const entropy = forceCalculator.informationEntropy(vector);
            const maxEntropy = Math.log2(vector.components.length);
            const normalizedEntropy = entropy / maxEntropy;
            
            container.innerHTML = `
                <div class="quantum-analysis">
                    <h6>⚛️ Information Quantum Analysis</h6>
                    <div class="quantum-metrics">
                        ${this.generateQuantumCard('excitatory', quantums.excitatory, quantums)}
                        ${this.generateQuantumCard('inhibitory', quantums.inhibitory, quantums)}
                        ${this.generateQuantumBalanceCard(quantums)}
                    </div>
                </div>
                
                <div class="entropy-analysis">
                    <h6>🌊 Entropy & Information Content</h6>
                    <div class="entropy-metrics">
                        ${this.generateEntropyCard('Shannon Entropy', entropy, 'bits', normalizedEntropy)}
                        ${this.generateEffectiveDimensionalityCard(vector)}
                        ${this.generateInformationDensityCard(entropy, vector.components.length)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error populating information analysis:', error);
        }
    }

    /**
     * Render simple chart
     */
    renderSimpleChart(containerId, components) {
        try {
            const container = document.getElementById(containerId);
            if (!container || !window.d3) return;

            container.innerHTML = '';
            
            const margin = { top: 20, right: 20, bottom: 40, left: 50 };
            const width = container.clientWidth - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = window.d3.select(container)
                .append('svg')
                .attr('width', '100%')
                .attr('height', '300px')
                .attr('viewBox', `0 0 ${container.clientWidth} 300`);

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const xScale = window.d3.scaleBand()
                .range([0, width])
                .padding(0.1)
                .domain(components.map((d, i) => i));

            const yScale = window.d3.scaleLinear()
                .range([height, 0])
                .domain(window.d3.extent(components));

            // Add bars
            g.selectAll('.bar')
                .data(components)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', (d, i) => xScale(i))
                .attr('width', xScale.bandwidth())
                .attr('y', d => yScale(Math.max(0, d)))
                .attr('height', d => Math.abs(yScale(d) - yScale(0)))
                .attr('fill', d => d >= 0 ? '#4ecdc4' : '#f06292')
                .attr('opacity', 0.8);

            // Add axes
            g.append('g')
                .attr('transform', `translate(0,${yScale(0)})`)
                .call(window.d3.axisBottom(xScale).tickFormat((d, i) => i % Math.ceil(components.length / 10) === 0 ? i : ''));

            g.append('g')
                .call(window.d3.axisLeft(yScale).ticks(8));
                
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    }

    /**
     * Generate quantum card HTML
     */
    generateQuantumCard(type, value, quantums) {
        const total = quantums.excitatory + quantums.inhibitory;
        const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0.0';
        const icon = type === 'excitatory' ? '⚡' : '🔋';
        
        return `
            <div class="quantum-card ${type}">
                <div class="quantum-header">
                    <span class="quantum-icon">${icon}</span>
                    <span class="quantum-title">${type.charAt(0).toUpperCase() + type.slice(1)} Quantum</span>
                </div>
                <div class="quantum-value">${value.toFixed(4)}</div>
                <div class="quantum-bar">
                    <div class="quantum-fill ${type}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Generate quantum balance card HTML
     */
    generateQuantumBalanceCard(quantums) {
        const balance = quantums.excitatory - quantums.inhibitory;
        const interpretation = this.getQuantumInterpretation(quantums);
        
        return `
            <div class="quantum-card balance">
                <div class="quantum-header">
                    <span class="quantum-icon">⚖️</span>
                    <span class="quantum-title">Quantum Balance</span>
                </div>
                <div class="quantum-value">${balance.toFixed(4)}</div>
                <div class="quantum-interpretation">${interpretation}</div>
            </div>
        `;
    }

    /**
     * Get quantum interpretation
     */
    getQuantumInterpretation(quantums) {
        const diff = quantums.excitatory - quantums.inhibitory;
        if (Math.abs(diff) < 0.1) return "Balanced information state";
        if (diff > 0) return "Excitatory dominant - activating";
        return "Inhibitory dominant - suppressing";
    }

    /**
     * Generate entropy card HTML
     */
    generateEntropyCard(title, value, unit, normalized) {
        return `
            <div class="entropy-card">
                <div class="entropy-header">
                    <span class="entropy-icon">📊</span>
                    <span class="entropy-title">${title}</span>
                </div>
                <div class="entropy-value">${value.toFixed(4)} ${unit}</div>
                <div class="entropy-bar">
                    <div class="entropy-fill" style="width: ${(normalized * 100).toFixed(1)}%"></div>
                </div>
                <div class="entropy-detail">${(normalized * 100).toFixed(1)}% of maximum entropy</div>
            </div>
        `;
    }

    /**
     * Generate effective dimensionality card HTML
     */
    generateEffectiveDimensionalityCard(vector) {
        const nonZeroComponents = vector.components.filter(c => Math.abs(c) > 0.001).length;
        const effectiveDimensionality = nonZeroComponents / vector.components.length;
        
        return `
            <div class="entropy-card">
                <div class="entropy-header">
                    <span class="entropy-icon">🎯</span>
                    <span class="entropy-title">Effective Dimensionality</span>
                </div>
                <div class="entropy-value">${(effectiveDimensionality * 100).toFixed(1)}%</div>
                <div class="entropy-detail">${nonZeroComponents} of ${vector.components.length} dimensions active</div>
            </div>
        `;
    }

    /**
     * Generate information density card HTML
     */
    generateInformationDensityCard(entropy, dimensions) {
        const density = entropy / dimensions;
        
        return `
            <div class="entropy-card">
                <div class="entropy-header">
                    <span class="entropy-icon">💎</span>
                    <span class="entropy-title">Information Density</span>
                </div>
                <div class="entropy-value">${density.toFixed(4)}</div>
                <div class="entropy-detail">bits per dimension</div>
            </div>
        `;
    }

    /**
     * Clean up resources
     */
    dispose() {
        try {
            // Remove event listeners
            this.framework.eventBus.off('vectorsGenerated', this.boundHandlers.onVectorsUpdated);
            this.framework.eventBus.off('vectorSelected', this.boundHandlers.onVectorSelected);
            this.framework.eventBus.off('vectorDeselected', this.boundHandlers.onVectorDeselected);
            
            // Dispose components
            for (const component of Object.values(this.components)) {
                if (component && typeof component.dispose === 'function') {
                    component.dispose();
                }
            }
            
            // Clear caches
            this.elements.clear();
            
        } catch (error) {
            console.error('Error during disposal:', error);
        }
    }
}

// Component Manager Classes (Placeholder implementations for modular architecture)

class TabManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Tab management logic
    }
    
    dispose() {
        // Cleanup
    }
}

class ChartManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Chart rendering logic
    }
    
    renderComponentsChart(containerId, components) {
        return this.studio.renderSimpleChart(containerId, components);
    }
    
    populateComponentsAnalysis(vector, stats) {
        return this.studio.populateComponentsAnalysis(vector, stats);
    }
    
    dispose() {
        // Cleanup
    }
}

class StatisticsManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Statistics calculation logic
    }
    
    update() {
        // Update statistics display
    }
    
    populateStatisticsAnalysis(vector, stats, forceCalculator) {
        return this.studio.populateStatisticsAnalysis(vector, stats, forceCalculator);
    }
    
    dispose() {
        // Cleanup
    }
}

class ClusteringManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Clustering algorithm setup
    }
    
    update() {
        // Update clustering display
    }
    
    dispose() {
        // Cleanup
    }
}

class RelationshipManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Relationship analysis setup
    }
    
    update() {
        // Update relationship display
    }
    
    populateRelationshipsAnalysis(vector) {
        // Relationship analysis for individual vector
    }
    
    dispose() {
        // Cleanup
    }
}

class PatternManager {
    constructor(studio) {
        this.studio = studio;
    }
    
    async initialize() {
        // Pattern detection setup
    }
    
    populatePatternAnalysis(vector, forceCalculator) {
        // Pattern analysis for individual vector
    }
    
    dispose() {
        // Cleanup
    }
} 