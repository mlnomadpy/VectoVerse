/**
 * Vector Analysis Studio - Enhanced Vector Analysis Module
 * Provides comprehensive vector analysis with improved UX/UI and modular architecture
 */

export class VectorAnalysisStudio {
    constructor(framework) {
        this.framework = framework;
        this.state = this.initializeState();
        this.elements = new Map();
        this.components = this.initializeComponents();
        this.boundHandlers = this.createBoundHandlers();
        
        this.initializeEventListeners();
        this.deferredInitialize();
    }

    initializeState() {
        return {
            selectedVector: null,
            currentView: 'overview',
            activeTab: 'individual',
            activeIndividualTab: 'components',
            isInitialized: false
        };
    }

    initializeComponents() {
        return {
            charts: null,
            statistics: null,
            clustering: null,
            relationships: null,
            patterns: null
        };
    }

    createBoundHandlers() {
        return {
            onStateChanged: this.onStateChanged.bind(this)
        };
    }

    initializeEventListeners() {
        try {
            const { eventBus } = this.framework;
            eventBus.on('stateChanged', this.boundHandlers.onStateChanged);
        } catch (error) {
            console.error('Failed to initialize event listeners:', error);
        }
    }

    deferredInitialize() {
        const initFn = () => this.initialize();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFn);
        } else {
            requestAnimationFrame(() => setTimeout(initFn, 100));
        }
    }

    async initialize() {
        if (this.state.isInitialized) return;
        
        try {
            this.cacheElements();
            this.setupUIEventHandlers();
            this.initializeTabSystem();
            this.updateInitialState();
            this.state.isInitialized = true;
            console.log('VectorAnalysisStudio initialized successfully');
        } catch (error) {
            console.error('Failed to initialize VectorAnalysisStudio:', error);
        }
    }

    cacheElements() {
        const elementIds = [
            'analysis-content', 'analysis-overview', 'analysis-detailed',
            'vector-select', 'vector-analysis-content', 'total-vectors',
            'vector-dimensions', 'avg-magnitude', 'max-similarity',
            'toggle-analysis-view', 'compare-vectors', 'export-analysis', 'back-to-overview'
        ];

        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) this.elements.set(id, element);
        });
    }

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

    updateInitialState() {
        this.updateOverviewStats();
        this.updateVectorSelector();
    }

    // Event Handlers
    onStateChanged(eventData) {
        this.safeExecute(() => {
            const reason = eventData?.reason;
            
            if (reason === 'vectorsGenerated') {
                this.onVectorsUpdated();
            } else if (reason === 'vectorSelected') {
                this.onVectorSelected();
            } else if (reason === 'inputVectorAdded' || reason === 'inputVectorRemoved') {
                this.updateOverviewStats();
                this.updateVectorSelector();
            }
        }, 'state changed');
    }

    onVectorsUpdated() {
        this.updateOverviewStats();
        this.updateVectorSelector();
        this.updateTabContent();
    }

    onVectorSelected() {
        const selectedVector = this.framework.stateManager.getSelectedVector();
        this.state.selectedVector = selectedVector;
        this.updateVectorSelector();
        this.updateIndividualAnalysis();
        this.toggleCompareButton(!selectedVector);
    }

    // UI Management Methods
    switchTab(targetTab, tabButtons, tabPanels) {
        this.safeExecute(() => {
            this.updateTabStates(tabButtons, tabPanels, targetTab);
            this.state.activeTab = targetTab;
            this.updateTabContent();
        }, 'tab switch');
    }

    updateTabStates(tabButtons, tabPanels, targetTab) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const activePanel = document.getElementById(`${targetTab}-tab`);
        
        if (activeButton && activePanel) {
            activeButton.classList.add('active');
            activePanel.classList.add('active');
        }
    }

    updateTabContent() {
        const { activeTab } = this.state;
        const tabActions = {
            individual: () => this.updateIndividualAnalysis(),
            relationships: () => this.updateRelationships(),
            clusters: () => this.updateClustering(),
            statistics: () => this.updateStatistics()
        };

        const action = tabActions[activeTab];
        if (action) {
            action();
        }
    }

    toggleView() {
        this.safeExecute(() => {
            const isOverview = this.state.currentView === 'overview';
            this.state.currentView = isOverview ? 'detailed' : 'overview';
            this.updateViewDisplay(isOverview);
        }, 'view toggle');
    }

    updateViewDisplay(wasOverview) {
        const overview = this.elements.get('analysis-overview');
        const detailed = this.elements.get('analysis-detailed');
        const toggleBtn = this.elements.get('toggle-analysis-view');

        if (overview && detailed && toggleBtn) {
            if (wasOverview) {
                overview.style.display = 'none';
                detailed.style.display = 'block';
                toggleBtn.innerHTML = '<span class="btn-icon">📊</span><span class="btn-text">Overview</span>';
            } else {
                overview.style.display = 'block';
                detailed.style.display = 'none';
                toggleBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Detailed View</span>';
            }
        }
    }

    showOverview() {
        this.safeExecute(() => {
            this.state.currentView = 'overview';
            this.updateViewDisplay(false);
        }, 'show overview');
    }

    toggleCompareButton(disabled) {
        const compareBtn = this.elements.get('compare-vectors');
        if (compareBtn) {
            compareBtn.disabled = disabled;
        }
    }

    // Data Management Methods
    updateOverviewStats() {
        this.safeExecute(() => {
            const { forceCalculator } = this.getModules();
            const { vectors } = this.getState();
            
            if (!forceCalculator || !vectors.length) {
                this.clearOverviewStats();
                return;
            }

            const stats = this.calculateOverviewStats(vectors, forceCalculator);
            this.displayOverviewStats(stats);
        }, 'overview stats update');
    }

    calculateOverviewStats(vectors, forceCalculator) {
        const totalVectors = vectors.length;
        const dimensions = vectors[0]?.components.length || 0;
        const avgMagnitude = vectors.reduce((sum, v) => 
            sum + forceCalculator.magnitude(v), 0) / vectors.length;
        
        let maxSimilarity = 0;
        for (let i = 0; i < vectors.length; i++) {
            for (let j = i + 1; j < vectors.length; j++) {
                const similarity = Math.abs(
                    forceCalculator.cosineSimilarity(vectors[i], vectors[j])
                );
                maxSimilarity = Math.max(maxSimilarity, similarity);
            }
        }

        return { totalVectors, dimensions, avgMagnitude, maxSimilarity };
    }

    displayOverviewStats({ totalVectors, dimensions, avgMagnitude, maxSimilarity }) {
        this.updateElement('total-vectors', totalVectors.toString());
        this.updateElement('vector-dimensions', dimensions.toString());
        this.updateElement('avg-magnitude', avgMagnitude.toFixed(2));
        this.updateElement('max-similarity', maxSimilarity.toFixed(2));
    }

    clearOverviewStats() {
        ['total-vectors', 'vector-dimensions', 'avg-magnitude', 'max-similarity']
            .forEach(id => this.updateElement(id, '0'));
    }

    updateVectorSelector() {
        this.safeExecute(() => {
            const vectorSelect = this.elements.get('vector-select');
            if (!vectorSelect) return;

            const { vectors } = this.getState();
            const selectedId = this.state.selectedVector?.id;

            vectorSelect.innerHTML = '<option value="">Click a vector or select here...</option>';
            
            vectors.forEach(vector => {
                const option = document.createElement('option');
                option.value = vector.id;
                option.textContent = `Vector ${vector.id}`;
                option.selected = vector.id === selectedId;
                vectorSelect.appendChild(option);
            });
        }, 'vector selector update');
    }

    updateIndividualAnalysis() {
        this.safeExecute(() => {
            const contentContainer = this.elements.get('vector-analysis-content');
            if (!contentContainer) return;

            if (!this.state.selectedVector) {
                this.showAnalysisPlaceholder(contentContainer);
                return;
            }

            const { forceCalculator } = this.getModules();
            if (!forceCalculator) {
                this.showError(contentContainer, 'Force calculator not available');
                return;
            }

            this.renderIndividualAnalysis(contentContainer);
        }, 'individual analysis update');
    }

    renderIndividualAnalysis(container) {
        const vector = this.state.selectedVector;
        const { forceCalculator } = this.getModules();
        
        const analysisData = this.calculateAnalysisData(vector, forceCalculator);
        container.innerHTML = this.generateAnalysisHTML(vector, analysisData);
        
        this.setupIndividualAnalysisTabs();
        this.populateAnalysisContent(vector, forceCalculator, analysisData);
    }

    calculateAnalysisData(vector, forceCalculator) {
        const quantums = forceCalculator.getInformationQuantums(vector);
        const stats = this.calculateVectorStats(vector, forceCalculator);
        
        const charge = this.determineCharge(quantums);
        const magnitude = forceCalculator.magnitude(vector);
        const entropy = forceCalculator.informationEntropy(vector);
        const sparsity = this.calculateSparsity(vector);

        return { quantums, stats, charge, magnitude, entropy, sparsity };
    }

    determineCharge(quantums) {
        if (quantums.excitatory > quantums.inhibitory) return "Positive";
        if (quantums.inhibitory > quantums.excitatory) return "Negative";
        return "Neutral";
    }

    calculateVectorStats(vector, forceCalculator) {
        const components = vector.components;
        const mean = components.reduce((a, b) => a + b, 0) / components.length;
        const variance = components.reduce((a, b) => 
            a + Math.pow(b - mean, 2), 0) / components.length;
        
        return {
            mean,
            variance,
            standardDeviation: Math.sqrt(variance),
            magnitude: forceCalculator.magnitude(vector),
            min: Math.min(...components),
            max: Math.max(...components)
        };
    }

    calculateSparsity(vector) {
        const threshold = 0.001;
        const zeroCount = vector.components.filter(c => Math.abs(c) < threshold).length;
        return zeroCount / vector.components.length;
    }

    generateAnalysisHTML(vector, data) {
        const { charge, magnitude, entropy, sparsity } = data;
        
        return `
            <div class="vector-analysis-card">
                ${this.generateAnalysisHeader(vector, { charge, magnitude, entropy, sparsity })}
                ${this.generateAnalysisTabs()}
            </div>
        `;
    }

    generateAnalysisHeader(vector, { charge, magnitude, entropy, sparsity }) {
        return `
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
                    ${this.generateBadge('charge', charge, this.getChargeIcon(charge))}
                    ${this.generateBadge('magnitude', magnitude.toFixed(3), '📏')}
                    ${this.generateBadge('sparsity', `${(sparsity * 100).toFixed(1)}% sparse`, '💎')}
                </div>
            </div>
        `;
    }

    generateBadge(type, text, icon) {
        return `
            <span class="vector-badge ${type}" title="${type}">
                <span class="badge-icon">${icon}</span>
                ${text}
            </span>
        `;
    }

    getChargeIcon(charge) {
        const icons = { Positive: '⚡', Negative: '🔋', Neutral: '⚖️' };
        return icons[charge] || '⚖️';
    }

    generateAnalysisTabs() {
        return `
            <div class="analysis-tabs-enhanced">
                <div class="tab-nav">
                    <button class="tab-nav-btn active" data-target="components">📊 Components</button>
                    <button class="tab-nav-btn" data-target="statistics">📈 Statistics</button>
                    <button class="tab-nav-btn" data-target="relationships">🔗 Relationships</button>
                    <button class="tab-nav-btn" data-target="clusters">🔍 Clusters</button>
                    <button class="tab-nav-btn" data-target="patterns">🧩 Patterns</button>
                    <button class="tab-nav-btn" data-target="information">🧠 Information</button>
                </div>
                
                <div class="tab-content-enhanced">
                    ${this.generateTabPanes()}
                </div>
            </div>
        `;
    }

    generateTabPanes() {
        const panes = [
            { id: 'components', content: this.generateComponentsPane() },
            { id: 'statistics', content: this.generateStatisticsPane() },
            { id: 'relationships', content: '<div class="relationships-enhanced" id="relationships-enhanced"></div>' },
            { id: 'clusters', content: '<div class="clusters-enhanced" id="clusters-enhanced"></div>' },
            { id: 'patterns', content: '<div class="patterns-analysis" id="patterns-analysis"></div>' },
            { id: 'information', content: '<div class="information-analysis" id="information-analysis"></div>' }
        ];

        return panes.map((pane, index) => `
            <div class="tab-pane ${index === 0 ? 'active' : ''}" id="${pane.id}-pane">
                ${pane.content}
            </div>
        `).join('');
    }

    generateComponentsPane() {
        return `
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
        `;
    }

    generateStatisticsPane() {
        return `
            <div class="statistics-enhanced">
                <div class="stats-categories" id="stats-categories"></div>
                <div class="statistical-insights">
                    <h6>💡 Statistical Insights</h6>
                    <div class="insights-list" id="statistical-insights"></div>
                </div>
            </div>
        `;
    }

    setupIndividualAnalysisTabs() {
        this.safeExecute(() => {
            const tabNavBtns = document.querySelectorAll('.tab-nav-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            tabNavBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-target');
                    this.switchIndividualTab(target, tabNavBtns, tabPanes);
                });
            });

            this.setupChartTypeSelector();
        }, 'individual analysis tabs setup');
    }

    switchIndividualTab(target, tabNavBtns, tabPanes) {
        tabNavBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        const targetBtn = document.querySelector(`[data-target="${target}"]`);
        const targetPane = document.getElementById(`${target}-pane`);
        
        if (targetBtn && targetPane) {
            targetBtn.classList.add('active');
            targetPane.classList.add('active');
            this.state.activeIndividualTab = target;
            
            // Trigger content population for the active tab
            this.updateIndividualTabContent(target);
        }
    }

    updateIndividualTabContent(target) {
        this.safeExecute(() => {
            const { selectedVector } = this.state;
            if (!selectedVector) return;

            const { forceCalculator } = this.getModules();
            if (!forceCalculator) return;

            switch (target) {
                            case 'relationships':
                this.updateIndividualRelationships();
                break;
                case 'clusters':
                    this.updateClustering();
                    break;
                case 'patterns':
                    this.populatePatternsAnalysis(selectedVector);
                    break;
                case 'information':
                    const quantums = forceCalculator.getInformationQuantums(selectedVector);
                    this.populateInformationAnalysis(selectedVector, forceCalculator, quantums);
                    break;
                case 'statistics':
                    const stats = this.calculateVectorStats(selectedVector, forceCalculator);
                    this.populateStatisticsAnalysis(selectedVector, stats, forceCalculator);
                    break;
                case 'components':
                    // Components tab is already populated, but let's ensure the chart is rendered
                    this.renderChart('components-chart-individual', selectedVector.components);
                    break;
            }
        }, `individual tab content update for ${target}`);
    }

    setupChartTypeSelector() {
        const chartTypeSelect = document.getElementById('chart-type-select');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', () => {
                if (this.state.selectedVector) {
                    this.renderChart('components-chart-individual', this.state.selectedVector.components);
                }
            });
        }
    }

    populateAnalysisContent(vector, forceCalculator, analysisData) {
        this.safeExecute(() => {
            this.populateComponentsAnalysis(vector, analysisData.stats);
            this.populateStatisticsAnalysis(vector, analysisData.stats, forceCalculator);
            this.populateInformationAnalysis(vector, forceCalculator, analysisData.quantums);
            this.populatePatternsAnalysis(vector);
            this.renderChart('components-chart-individual', vector.components);
            
            // Don't initialize relationships and clustering here since their containers don't exist yet
            // They will be initialized when their respective tabs are clicked
        }, 'analysis content population');
    }

    populateComponentsAnalysis(vector, stats) {
        const insightGrid = document.getElementById('insight-grid');
        const extremesList = document.getElementById('extremes-list');
        
        if (insightGrid) {
            const insights = this.calculateComponentInsights(vector, stats);
            insightGrid.innerHTML = this.generateInsightCards(insights);
        }
        
        if (extremesList) {
            const extremes = this.calculateComponentExtremes(vector);
            extremesList.innerHTML = this.generateExtremesHTML(extremes);
        }
    }

    calculateComponentInsights(vector, stats) {
        const positiveComps = vector.components.filter(c => c > 0);
        const negativeComps = vector.components.filter(c => c < 0);
        const magnitude = stats.magnitude || 0;
        const strongComponents = vector.components.filter(c => Math.abs(c) > magnitude * 0.3);

        return [
            {
                type: 'positive',
                icon: '⬆️',
                title: 'Positive Components',
                value: positiveComps.length,
                detail: `Avg: ${positiveComps.length > 0 ? (positiveComps.reduce((a, b) => a + b, 0) / positiveComps.length).toFixed(3) : '0.000'}`
            },
            {
                type: 'negative',
                icon: '⬇️',
                title: 'Negative Components',
                value: negativeComps.length,
                detail: `Avg: ${negativeComps.length > 0 ? (negativeComps.reduce((a, b) => a + b, 0) / negativeComps.length).toFixed(3) : '0.000'}`
            },
            {
                type: 'dominant',
                icon: '💪',
                title: 'Strong Components',
                value: strongComponents.length,
                detail: '> 30% of magnitude'
            }
        ];
    }

    generateInsightCards(insights) {
        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <span class="insight-title">${insight.title}</span>
                </div>
                <div class="insight-value">${insight.value}</div>
                <div class="insight-detail">${insight.detail}</div>
            </div>
        `).join('');
    }

    calculateComponentExtremes(vector) {
        const componentsWithIndex = vector.components.map((value, index) => ({ value, index }));
        const sortedByAbs = [...componentsWithIndex].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        
        return sortedByAbs.slice(0, 3);
    }

    generateExtremesHTML(extremes) {
        return `
            <div class="extreme-category">
                <div class="extreme-header">
                    <span class="extreme-icon">🔝</span>
                    <span class="extreme-title">Highest Components</span>
                </div>
                <div class="extreme-items">
                    ${extremes.map(item => `
                        <div class="extreme-item">
                            <span class="extreme-index">dim ${item.index + 1}</span>
                            <span class="extreme-value ${item.value >= 0 ? 'positive' : 'negative'}">${item.value.toFixed(4)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    populateStatisticsAnalysis(vector, stats, forceCalculator) {
        const statsCategories = document.getElementById('stats-categories');
        const statisticalInsights = document.getElementById('statistical-insights');
        
        if (statsCategories) {
            statsCategories.innerHTML = this.generateStatsCategories(stats);
        }
        
        if (statisticalInsights) {
            const insights = this.generateStatisticalInsights(vector, stats);
            statisticalInsights.innerHTML = this.generateInsightsHTML(insights);
        }
    }

    generateStatsCategories(stats) {
        return `
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

    generateInsightsHTML(insights) {
        return insights.map(insight => `
            <div class="insight-item">
                <span class="insight-indicator">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');
    }

    populateInformationAnalysis(vector, forceCalculator, quantums) {
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
    }

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

    getQuantumInterpretation(quantums) {
        const diff = quantums.excitatory - quantums.inhibitory;
        if (Math.abs(diff) < 0.1) return "Balanced information state";
        if (diff > 0) return "Excitatory dominant - activating";
        return "Inhibitory dominant - suppressing";
    }

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

    // Chart Rendering
    renderChart(containerId, components) {
        this.safeExecute(() => {
            if (!this.components.charts) {
                this.components.charts = new ChartManager(this);
            }
            this.components.charts.renderChart(containerId, components);
        }, 'chart rendering');
    }

    // Tab Update Methods
    updateRelationships() {
        this.safeExecute(() => {
            if (!this.components.relationships) {
                this.components.relationships = new RelationshipAnalyzer(this);
            }
            this.components.relationships.update();
        }, 'relationships update');
    }

    updateIndividualRelationships() {
        this.safeExecute(() => {
            const container = document.getElementById('relationships-enhanced');
            if (!container) return;

            const { selectedVector } = this.state;
            const { vectors } = this.getState();
            const { forceCalculator } = this.getModules();

            if (!selectedVector || !vectors || vectors.length < 2) {
                container.innerHTML = '<p>Need at least 2 vectors and a selected vector for relationship analysis.</p>';
                return;
            }

            // Calculate relationships with all other vectors using all metrics
            const otherVectors = vectors.filter(v => v.id !== selectedVector.id);
            const relationships = this.calculateAllMetricsRelationships(selectedVector, otherVectors, forceCalculator);

            container.innerHTML = this.generateIndividualRelationshipHTML(relationships);
            this.setupIndividualRelationshipControls(relationships);
        }, 'individual relationships update');
    }

    calculateAllMetricsRelationships(selectedVector, otherVectors, forceCalculator) {
        return otherVectors.map(vector => {
            return {
                vector,
                metrics: {
                    cosine: forceCalculator.cosineSimilarity(selectedVector, vector),
                    correlation: forceCalculator.correlation(selectedVector, vector),
                    euclidean: forceCalculator.euclideanDistance(selectedVector, vector),
                    manhattan: forceCalculator.manhattanDistance(selectedVector, vector),
                    resonance: forceCalculator.resonanceForce(selectedVector, vector),
                    quantum: forceCalculator.quantumEntanglement ? 
                        forceCalculator.quantumEntanglement(selectedVector, vector) :
                        Math.abs(forceCalculator.correlation(selectedVector, vector))
                }
            };
        });
    }

    generateIndividualRelationshipHTML(relationships) {
        return `
            <div class="individual-relationships">
                <div class="relationship-header">
                    <h6>🔗 Vector ${this.state.selectedVector.id} Relationships</h6>
                    <div class="metric-selector">
                        <label for="individual-metric-select">Sort by:</label>
                        <select id="individual-metric-select" class="mini-select">
                            <option value="cosine">Cosine Similarity</option>
                            <option value="correlation">Pearson Correlation</option>
                            <option value="euclidean">Euclidean Distance (inverted)</option>
                            <option value="manhattan">Manhattan Distance (inverted)</option>
                            <option value="resonance">Resonance Force</option>
                            <option value="quantum">Quantum Entanglement</option>
                        </select>
                    </div>
                </div>
                
                <div class="metrics-overview">
                    <h6>📊 Metrics Overview</h6>
                    <div class="metrics-grid" id="metrics-overview-grid">
                        ${this.generateMetricsOverview(relationships)}
                    </div>
                </div>
                
                <div class="relationship-details">
                    <h6>📋 Detailed Relationships</h6>
                    <div class="relationships-table" id="individual-relationships-table">
                        ${this.generateRelationshipsTable(relationships, 'cosine')}
                    </div>
                </div>
            </div>
        `;
    }

    generateMetricsOverview(relationships) {
        const metrics = ['cosine', 'correlation', 'euclidean', 'manhattan', 'resonance', 'quantum'];
        const metricLabels = {
            cosine: 'Cosine Similarity',
            correlation: 'Correlation',
            euclidean: 'Euclidean Distance',
            manhattan: 'Manhattan Distance', 
            resonance: 'Resonance Force',
            quantum: 'Quantum Entanglement'
        };
        const metricIcons = {
            cosine: '📐',
            correlation: '📈',
            euclidean: '📏',
            manhattan: '🛣️',
            resonance: '🌊',
            quantum: '⚛️'
        };

        return metrics.map(metric => {
            const values = relationships.map(r => Math.abs(r.metrics[metric]));
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const maxVector = relationships.find(r => Math.abs(r.metrics[metric]) === max);

            return `
                <div class="metric-overview-card">
                    <div class="metric-header">
                        <span class="metric-icon">${metricIcons[metric]}</span>
                        <span class="metric-name">${metricLabels[metric]}</span>
                    </div>
                    <div class="metric-stats">
                        <div class="stat-item">
                            <span class="stat-label">Average:</span>
                            <span class="stat-value">${avg.toFixed(3)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Best Match:</span>
                            <span class="stat-value">V${maxVector?.vector.id} (${max.toFixed(3)})</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateRelationshipsTable(relationships, sortMetric) {
        // Sort relationships by the selected metric
        const sorted = [...relationships].sort((a, b) => {
            const valueA = sortMetric === 'euclidean' || sortMetric === 'manhattan' ? 
                -Math.abs(a.metrics[sortMetric]) : Math.abs(a.metrics[sortMetric]);
            const valueB = sortMetric === 'euclidean' || sortMetric === 'manhattan' ? 
                -Math.abs(b.metrics[sortMetric]) : Math.abs(b.metrics[sortMetric]);
            return valueB - valueA;
        });

        return `
            <div class="relationships-table-container">
                <table class="relationships-table">
                    <thead>
                        <tr>
                            <th>Vector</th>
                            <th>Cosine</th>
                            <th>Correlation</th>
                            <th>Euclidean</th>
                            <th>Manhattan</th>
                            <th>Resonance</th>
                            <th>Quantum</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(rel => `
                            <tr class="relationship-row">
                                <td class="vector-cell">
                                    <span class="vector-id">V${rel.vector.id}</span>
                                </td>
                                <td class="metric-cell ${sortMetric === 'cosine' ? 'highlighted' : ''}">${rel.metrics.cosine.toFixed(3)}</td>
                                <td class="metric-cell ${sortMetric === 'correlation' ? 'highlighted' : ''}">${rel.metrics.correlation.toFixed(3)}</td>
                                <td class="metric-cell ${sortMetric === 'euclidean' ? 'highlighted' : ''}">${rel.metrics.euclidean.toFixed(3)}</td>
                                <td class="metric-cell ${sortMetric === 'manhattan' ? 'highlighted' : ''}">${rel.metrics.manhattan.toFixed(3)}</td>
                                <td class="metric-cell ${sortMetric === 'resonance' ? 'highlighted' : ''}">${rel.metrics.resonance.toFixed(3)}</td>
                                <td class="metric-cell ${sortMetric === 'quantum' ? 'highlighted' : ''}">${rel.metrics.quantum.toFixed(3)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupIndividualRelationshipControls(relationships) {
        const metricSelect = document.getElementById('individual-metric-select');
        if (metricSelect) {
            metricSelect.addEventListener('change', (e) => {
                const selectedMetric = e.target.value;
                const tableContainer = document.getElementById('individual-relationships-table');
                if (tableContainer) {
                    tableContainer.innerHTML = this.generateRelationshipsTable(relationships, selectedMetric);
                }
            });
        }
    }

    updateClustering() {
        console.log('🎯 VectorAnalysisStudio.updateClustering() called');
        this.safeExecute(() => {
            // Check if we're in the main tab context or individual analysis context
            const mainClustersContainer = document.getElementById('clusters-tab');
            const individualClustersContainer = document.getElementById('clusters-enhanced');
            
            console.log('Container check:', {
                mainClusters: !!mainClustersContainer,
                individualClusters: !!individualClustersContainer
            });
            
            if (mainClustersContainer) {
                console.log('Updating main clusters tab');
                this.updateMainClustering(mainClustersContainer);
            } else if (individualClustersContainer) {
                console.log('Updating individual clusters tab');
                if (!this.components.clustering) {
                    console.log('Creating new ClusteringAnalyzer instance');
                    this.components.clustering = new ClusteringAnalyzer(this);
                }
                console.log('Calling clustering.update()');
                this.components.clustering.update();
            } else {
                console.warn('No clustering container found');
            }
        }, 'clustering update');
    }

    updateMainClustering(container) {
        const { vectors } = this.getState();
        if (!vectors || vectors.length < 2) {
            container.innerHTML = '<p>Need at least 2 vectors for clustering analysis.</p>';
            return;
        }

        // Create a temporary clustering analyzer for the main tab
        const mainClusteringAnalyzer = {
            studio: this,
            currentAlgorithm: 'kmeans',
            numClusters: 3,
            
            generateClusteringHTML() {
                return `
                    <div class="clustering-controls">
                        <div class="control-group">
                            <label for="main-clustering-algorithm">Algorithm:</label>
                            <select id="main-clustering-algorithm" class="mini-select">
                                <option value="kmeans">K-Means</option>
                                <option value="hierarchical">Hierarchical</option>
                                <option value="dbscan">DBSCAN</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label for="main-num-clusters">Number of Clusters:</label>
                            <input type="range" id="main-num-clusters" min="2" max="10" value="3">
                            <span id="main-clusters-value">3</span>
                        </div>
                        <button id="main-run-clustering" class="btn-compact">🔄 Run Clustering</button>
                    </div>
                    
                    <div class="clustering-results">
                        <div class="cluster-summary" id="main-cluster-summary"></div>
                        <div class="cluster-details" id="main-cluster-details"></div>
                    </div>
                `;
            },
            
            setupControls() {
                console.log('🎛️ Setting up main clustering controls...');
                setTimeout(() => {
                    const runButton = document.getElementById('main-run-clustering');
                    if (runButton) {
                        runButton.addEventListener('click', () => {
                            console.log('🔄 Main clustering button clicked!');
                            this.performClustering();
                        });
                        console.log('✅ Main clustering button handler registered');
                    }
                }, 100);
            },
            
            performClustering() {
                console.log('🔄 Performing main clustering...');
                // Use the same clustering logic as the individual analyzer
                if (!this.studio.components.clustering) {
                    this.studio.components.clustering = new ClusteringAnalyzer(this.studio);
                }
                const vectors = this.studio.getState().vectors;
                const clusters = this.studio.components.clustering.kMeansClustering(vectors, this.numClusters);
                this.renderResults(clusters);
            },
            
            renderResults(clusters) {
                const summaryContainer = document.getElementById('main-cluster-summary');
                const detailsContainer = document.getElementById('main-cluster-details');
                
                if (summaryContainer && detailsContainer) {
                    // Use the same rendering logic as the individual analyzer
                    if (!this.studio.components.clustering) {
                        this.studio.components.clustering = new ClusteringAnalyzer(this.studio);
                    }
                    
                    // Temporarily change the IDs for rendering
                    summaryContainer.id = 'cluster-summary';
                    detailsContainer.id = 'cluster-details';
                    
                    this.studio.components.clustering.renderClusteringResults(clusters);
                    
                    // Change IDs back
                    summaryContainer.id = 'main-cluster-summary';
                    detailsContainer.id = 'main-cluster-details';
                }
            }
        };
        
        container.innerHTML = mainClusteringAnalyzer.generateClusteringHTML();
        mainClusteringAnalyzer.setupControls();
        mainClusteringAnalyzer.performClustering();
    }

    updateStatistics() {
        this.safeExecute(() => {
            if (!this.components.statistics) {
                this.components.statistics = new StatisticsAnalyzer(this);
            }
            this.components.statistics.update();
        }, 'statistics update');
    }

    // Utility Methods
    showAnalysisPlaceholder(container) {
        container.innerHTML = `
            <div class="analysis-placeholder">
                <div class="placeholder-icon">🎯</div>
                <h3>Select a Vector to Begin Analysis</h3>
                <p>Click on any vector in the visualization or use the dropdown above to start exploring detailed properties and relationships.</p>
            </div>
        `;
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="analysis-error">
                <div class="error-icon">⚠️</div>
                <h3>Analysis Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    handleVectorSelection(event) {
        this.safeExecute(() => {
            const vectorId = parseInt(event.target.value);
            if (vectorId || vectorId === 0) {
                this.framework.selectVector(vectorId);
            }
        }, 'vector selection');
    }

    compareVectors() {
        this.safeExecute(() => {
            if (!this.components.comparison) {
                this.components.comparison = new VectorComparison(this);
            }
            this.components.comparison.show();
        }, 'vector comparison');
    }

    exportAnalysis() {
        this.safeExecute(() => {
            if (!this.components.exporter) {
                this.components.exporter = new AnalysisExporter(this);
            }
            this.components.exporter.exportCurrentAnalysis();
        }, 'analysis export');
    }

    updateElement(id, content) {
        const element = this.elements.get(id) || document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    getModules() {
        try {
            return this.framework.getModules();
        } catch (error) {
            console.error('Failed to get modules:', error);
            return {};
        }
    }

    getState() {
        try {
            return this.framework.getState();
        } catch (error) {
            console.error('Failed to get state:', error);
            return { vectors: [] };
        }
    }

    safeExecute(fn, context) {
        try {
            fn();
        } catch (error) {
            console.error(`Error in ${context}:`, error);
        }
    }

    dispose() {
        try {
            // Remove event listeners
            const { eventBus } = this.framework;
            eventBus.off('stateChanged', this.boundHandlers.onStateChanged);
            
            // Dispose components
            Object.values(this.components).forEach(component => {
                if (component?.dispose) {
                    component.dispose();
                }
            });
            
            // Clear caches
            this.elements.clear();
            
        } catch (error) {
            console.error('Error during disposal:', error);
        }
    }

    populatePatternsAnalysis(vector) {
        if (!this.components.patterns) {
            this.components.patterns = new PatternManager(this);
        }
        this.components.patterns.update();
    }
}

// ========================================
// MODULAR COMPONENT CLASSES
// ========================================

/**
 * Chart Manager - Handles all chart rendering and visualization
 */
class ChartManager {
    constructor(studio) {
        this.studio = studio;
        this.chartTypes = ['bar', 'line', 'histogram', 'radial'];
        this.currentChartType = 'bar';
    }

    renderChart(containerId, components) {
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

        // Get chart type from selector
        const chartTypeSelect = document.getElementById('chart-type-select');
        const chartType = chartTypeSelect?.value || 'bar';

        switch (chartType) {
            case 'line':
                this.renderLineChart(g, components, width, height);
                break;
            case 'histogram':
                this.renderHistogram(g, components, width, height);
                break;
            case 'radial':
                this.renderRadialChart(g, components, width, height);
                break;
            default:
                this.renderBarChart(g, components, width, height);
        }
    }

    renderBarChart(g, components, width, height) {
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
            .attr('opacity', 0.8)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        this.addAxes(g, xScale, yScale, height, components.length);
    }

    renderLineChart(g, components, width, height) {
        const xScale = window.d3.scaleLinear()
            .range([0, width])
            .domain([0, components.length - 1]);

        const yScale = window.d3.scaleLinear()
            .range([height, 0])
            .domain(window.d3.extent(components));

        const line = window.d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d))
            .curve(window.d3.curveMonotoneX);

        // Add line
        g.append('path')
            .datum(components)
            .attr('fill', 'none')
            .attr('stroke', '#4ecdc4')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add dots
        g.selectAll('.dot')
            .data(components)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', (d, i) => xScale(i))
            .attr('cy', d => yScale(d))
            .attr('r', 4)
            .attr('fill', d => d >= 0 ? '#4ecdc4' : '#f06292')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        this.addAxes(g, xScale, yScale, height, components.length);
    }

    renderHistogram(g, components, width, height) {
        const bins = window.d3.histogram()
            .domain(window.d3.extent(components))
            .thresholds(10)(components);

        const xScale = window.d3.scaleLinear()
            .domain(window.d3.extent(components))
            .range([0, width]);

        const yScale = window.d3.scaleLinear()
            .domain([0, window.d3.max(bins, d => d.length)])
            .range([height, 0]);

        g.selectAll('.bar')
            .data(bins)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.x0))
            .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr('y', d => yScale(d.length))
            .attr('height', d => height - yScale(d.length))
            .attr('fill', '#4ecdc4')
            .attr('opacity', 0.8);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(window.d3.axisBottom(xScale));

        g.append('g')
            .call(window.d3.axisLeft(yScale));
    }

    renderRadialChart(g, components, width, height) {
        const radius = Math.min(width, height) / 2 - 20;
        const centerX = width / 2;
        const centerY = height / 2;

        const angleScale = window.d3.scaleLinear()
            .domain([0, components.length])
            .range([0, 2 * Math.PI]);

        const radiusScale = window.d3.scaleLinear()
            .domain(window.d3.extent(components))
            .range([0, radius]);

        // Add center point
        g.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', 3)
            .attr('fill', '#fff');

        // Add radial lines
        components.forEach((value, i) => {
            const angle = angleScale(i);
            const r = Math.abs(radiusScale(value));
            
            g.append('line')
                .attr('x1', centerX)
                .attr('y1', centerY)
                .attr('x2', centerX + r * Math.cos(angle - Math.PI/2))
                .attr('y2', centerY + r * Math.sin(angle - Math.PI/2))
                .attr('stroke', value >= 0 ? '#4ecdc4' : '#f06292')
                .attr('stroke-width', 2);

            g.append('circle')
                .attr('cx', centerX + r * Math.cos(angle - Math.PI/2))
                .attr('cy', centerY + r * Math.sin(angle - Math.PI/2))
                .attr('r', 3)
                .attr('fill', value >= 0 ? '#4ecdc4' : '#f06292');
        });
    }

    addAxes(g, xScale, yScale, height, numComponents) {
        g.append('g')
            .attr('transform', `translate(0,${yScale(0)})`)
            .call(window.d3.axisBottom(xScale).tickFormat((d, i) => 
                i % Math.ceil(numComponents / 10) === 0 ? i : ''));

        g.append('g')
            .call(window.d3.axisLeft(yScale).ticks(8));
    }

    showTooltip(event, value) {
        const tooltip = window.d3.select('body')
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .text(`Value: ${value.toFixed(4)}`);

        const [mouseX, mouseY] = window.d3.pointer(event, document.body);
        tooltip
            .style('left', (mouseX + 10) + 'px')
            .style('top', (mouseY - 10) + 'px');
    }

    hideTooltip() {
        window.d3.selectAll('.chart-tooltip').remove();
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Pattern Manager - Handles pattern detection and analysis
 */
class PatternManager {
    constructor(studio) {
        this.studio = studio;
    }

    update() {
        const container = document.getElementById('patterns-analysis');
        if (!container) return;

        const { selectedVector } = this.studio.state;
        if (!selectedVector) {
            container.innerHTML = '<p>No vector selected for pattern analysis.</p>';
            return;
        }

        container.innerHTML = this.generatePatternHTML();
        this.analyzePatterns(selectedVector);
    }

    generatePatternHTML() {
        return `
            <div class="pattern-detection">
                <h6>🧩 Pattern Detection</h6>
                <div class="pattern-results" id="pattern-results"></div>
            </div>
            
            <div class="anomaly-detection">
                <h6>⚠️ Anomaly Detection</h6>
                <div class="anomaly-results" id="anomaly-results"></div>
            </div>
        `;
    }

    analyzePatterns(vector) {
        const patterns = this.detectPatterns(vector.components);
        const anomalies = this.detectAnomalies(vector.components);
        
        this.renderPatternResults(patterns);
        this.renderAnomalyResults(anomalies);
    }

    detectPatterns(components) {
        const patterns = [];
        
        // Monotonic pattern
        const monotonic = this.checkMonotonic(components);
        if (monotonic.confidence > 0.6) {
            patterns.push({
                type: 'Monotonic',
                icon: '📈',
                description: `${monotonic.direction} trend`,
                confidence: monotonic.confidence,
                strength: monotonic.strength
            });
        }
        
        // Periodic pattern
        const periodic = this.checkPeriodic(components);
        if (periodic.confidence > 0.5) {
            patterns.push({
                type: 'Periodic',
                icon: '🌊',
                description: `Period: ${periodic.period}`,
                confidence: periodic.confidence,
                strength: periodic.strength
            });
        }
        
        // Symmetry pattern
        const symmetry = this.checkSymmetry(components);
        if (symmetry.confidence > 0.7) {
            patterns.push({
                type: 'Symmetry',
                icon: '🪞',
                description: `${symmetry.type} symmetry`,
                confidence: symmetry.confidence,
                strength: symmetry.strength
            });
        }
        
        return patterns;
    }

    checkMonotonic(components) {
        let increasing = 0;
        let decreasing = 0;
        
        for (let i = 1; i < components.length; i++) {
            if (components[i] > components[i-1]) increasing++;
            else if (components[i] < components[i-1]) decreasing++;
        }
        
        const total = components.length - 1;
        const incRatio = increasing / total;
        const decRatio = decreasing / total;
        
        const maxRatio = Math.max(incRatio, decRatio);
        const direction = incRatio > decRatio ? 'Increasing' : 'Decreasing';
        
        return {
            confidence: maxRatio,
            direction,
            strength: maxRatio
        };
    }

    checkPeriodic(components) {
        // Simple autocorrelation-based period detection
        let bestPeriod = 0;
        let maxCorrelation = 0;
        
        for (let period = 2; period <= Math.floor(components.length / 3); period++) {
            const correlation = this.autocorrelation(components, period);
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation;
                bestPeriod = period;
            }
        }
        
        return {
            confidence: maxCorrelation,
            period: bestPeriod,
            strength: maxCorrelation
        };
    }

    autocorrelation(data, lag) {
        const n = data.length - lag;
        if (n <= 0) return 0;
        
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
            const x = data[i] - mean;
            const y = data[i + lag] - mean;
            numerator += x * y;
            denominator += x * x;
        }
        
        return denominator > 0 ? Math.abs(numerator / denominator) : 0;
    }

    checkSymmetry(components) {
        const n = components.length;
        let symmetryScore = 0;
        
        // Check reflection symmetry around center
        for (let i = 0; i < Math.floor(n / 2); i++) {
            const diff = Math.abs(components[i] - components[n - 1 - i]);
            const avg = (Math.abs(components[i]) + Math.abs(components[n - 1 - i])) / 2;
            symmetryScore += avg > 0 ? 1 - (diff / avg) : 1;
        }
        
        const confidence = symmetryScore / Math.floor(n / 2);
        
        return {
            confidence: Math.max(0, confidence),
            type: 'Reflection',
            strength: confidence
        };
    }

    detectAnomalies(components) {
        const mean = components.reduce((a, b) => a + b, 0) / components.length;
        const variance = components.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / components.length;
        const stdDev = Math.sqrt(variance);
        
        const threshold = 2.5; // Z-score threshold
        const anomalies = [];
        
        components.forEach((value, index) => {
            const zScore = Math.abs((value - mean) / stdDev);
            if (zScore > threshold) {
                anomalies.push({
                    index,
                    value,
                    zScore,
                    severity: zScore > 3 ? 'High' : 'Medium'
                });
            }
        });
        
        return anomalies;
    }

    renderPatternResults(patterns) {
        const container = document.getElementById('pattern-results');
        if (!container) return;
        
        if (patterns.length === 0) {
            container.innerHTML = '<p>No significant patterns detected.</p>';
            return;
        }
        
        container.innerHTML = patterns.map(pattern => `
            <div class="pattern-item">
                <div class="pattern-header">
                    <span class="pattern-icon">${pattern.icon}</span>
                    <span class="pattern-type">${pattern.type}</span>
                    <span class="pattern-confidence">${(pattern.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="pattern-description">${pattern.description}</div>
                <div class="pattern-strength-bar">
                    <div class="pattern-strength-fill" style="width: ${pattern.strength * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    renderAnomalyResults(anomalies) {
        const container = document.getElementById('anomaly-results');
        if (!container) return;
        
        if (anomalies.length === 0) {
            container.innerHTML = '<p>No anomalies detected.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="anomaly-summary">
                <span class="anomaly-count">${anomalies.length} anomalies detected</span>
            </div>
            <div class="anomaly-list">
                ${anomalies.map(anomaly => `
                    <div class="anomaly-item ${anomaly.severity.toLowerCase()}">
                        <div class="anomaly-position">Dim ${anomaly.index + 1}</div>
                        <div class="anomaly-value">${anomaly.value.toFixed(4)}</div>
                        <div class="anomaly-score">Z: ${anomaly.zScore.toFixed(2)}</div>
                        <div class="anomaly-severity">${anomaly.severity}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Vector Comparison - Handles vector comparison functionality
 */
class VectorComparison {
    constructor(studio) {
        this.studio = studio;
    }

    show() {
        const { vectors } = this.studio.getState();
        if (!vectors || vectors.length < 2) {
            alert('Need at least 2 vectors for comparison.');
            return;
        }

        this.createComparisonModal(vectors);
    }

    createComparisonModal(vectors) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'comparison-modal-overlay';
        overlay.innerHTML = `
            <div class="comparison-modal">
                <div class="comparison-header">
                    <h3>🔍 Vector Comparison</h3>
                    <button class="close-comparison">✕</button>
                </div>
                <div class="comparison-content">
                    <div class="vector-selector-grid">
                        <div class="selector-group">
                            <label>Vector A:</label>
                            <select id="vector-a-select">
                                ${vectors.map(v => `<option value="${v.id}">Vector ${v.id}</option>`).join('')}
                            </select>
                        </div>
                        <div class="selector-group">
                            <label>Vector B:</label>
                            <select id="vector-b-select">
                                ${vectors.map(v => `<option value="${v.id}">Vector ${v.id}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="comparison-results" id="comparison-results"></div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.setupComparisonEventHandlers(overlay, vectors);
        this.performComparison(vectors);
    }

    setupComparisonEventHandlers(overlay, vectors) {
        const closeBtn = overlay.querySelector('.close-comparison');
        const vectorASelect = overlay.querySelector('#vector-a-select');
        const vectorBSelect = overlay.querySelector('#vector-b-select');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        vectorASelect.addEventListener('change', () => this.performComparison(vectors));
        vectorBSelect.addEventListener('change', () => this.performComparison(vectors));
    }

    performComparison(vectors) {
        const vectorASelect = document.getElementById('vector-a-select');
        const vectorBSelect = document.getElementById('vector-b-select');
        const resultsContainer = document.getElementById('comparison-results');

        if (!vectorASelect || !vectorBSelect || !resultsContainer) return;

        const vectorA = vectors.find(v => v.id === parseInt(vectorASelect.value));
        const vectorB = vectors.find(v => v.id === parseInt(vectorBSelect.value));

        if (!vectorA || !vectorB) return;

        const comparison = this.calculateComparison(vectorA, vectorB);
        this.renderComparisonResults(comparison, resultsContainer);
    }

    calculateComparison(vectorA, vectorB) {
        const { forceCalculator } = this.studio.getModules();
        
        return {
            vectorA,
            vectorB,
            cosineSimilarity: forceCalculator.cosineSimilarity(vectorA, vectorB),
            euclideanDistance: forceCalculator.euclideanDistance(vectorA, vectorB),
            manhattanDistance: forceCalculator.manhattanDistance(vectorA, vectorB),
            magnitudeA: forceCalculator.magnitude(vectorA),
            magnitudeB: forceCalculator.magnitude(vectorB),
            dotProduct: this.dotProduct(vectorA.components, vectorB.components),
            angleBetween: this.angleBetween(vectorA.components, vectorB.components)
        };
    }

    dotProduct(a, b) {
        return a.reduce((sum, val, i) => sum + val * b[i], 0);
    }

    angleBetween(a, b) {
        const dotProd = this.dotProduct(a, b);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return Math.acos(dotProd / (magA * magB)) * (180 / Math.PI);
    }

    renderComparisonResults(comparison, container) {
        container.innerHTML = `
            <div class="comparison-metrics">
                <div class="metric-card">
                    <div class="metric-label">Cosine Similarity</div>
                    <div class="metric-value">${comparison.cosineSimilarity.toFixed(4)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Euclidean Distance</div>
                    <div class="metric-value">${comparison.euclideanDistance.toFixed(4)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Manhattan Distance</div>
                    <div class="metric-value">${comparison.manhattanDistance.toFixed(4)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Angle Between</div>
                    <div class="metric-value">${comparison.angleBetween.toFixed(2)}°</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Dot Product</div>
                    <div class="metric-value">${comparison.dotProduct.toFixed(4)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Magnitude Ratio</div>
                    <div class="metric-value">${(comparison.magnitudeA / comparison.magnitudeB).toFixed(4)}</div>
                </div>
            </div>
        `;
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Analysis Exporter - Handles analysis export functionality
 */
class AnalysisExporter {
    constructor(studio) {
        this.studio = studio;
    }

    exportCurrentAnalysis() {
        const { vectors } = this.studio.getState();
        const selectedVector = this.studio.state.selectedVector;
        
        if (!vectors || vectors.length === 0) {
            alert('No vectors available for export.');
            return;
        }

        const analysisData = this.gatherAnalysisData(vectors, selectedVector);
        this.showExportModal(analysisData);
    }

    gatherAnalysisData(vectors, selectedVector) {
        const { forceCalculator } = this.studio.getModules();
        
        const data = {
            timestamp: new Date().toISOString(),
            totalVectors: vectors.length,
            selectedVector: selectedVector?.id || null,
            globalStats: this.calculateGlobalStats(vectors, forceCalculator),
            vectors: vectors.map(vector => ({
                id: vector.id,
                components: vector.components,
                magnitude: forceCalculator.magnitude(vector),
                entropy: forceCalculator.informationEntropy(vector),
                quantums: forceCalculator.getInformationQuantums(vector)
            }))
        };

        if (selectedVector) {
            data.selectedVectorAnalysis = this.getSelectedVectorAnalysis(selectedVector, forceCalculator);
        }

        return data;
    }

    calculateGlobalStats(vectors, forceCalculator) {
        const magnitudes = vectors.map(v => forceCalculator.magnitude(v));
        const entropies = vectors.map(v => forceCalculator.informationEntropy(v));
        
        return {
            avgMagnitude: magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length,
            avgEntropy: entropies.reduce((a, b) => a + b, 0) / entropies.length,
            dimensions: vectors[0]?.components.length || 0
        };
    }

    getSelectedVectorAnalysis(vector, forceCalculator) {
        return {
            id: vector.id,
            magnitude: forceCalculator.magnitude(vector),
            entropy: forceCalculator.informationEntropy(vector),
            quantums: forceCalculator.getInformationQuantums(vector),
            statistics: {
                mean: vector.components.reduce((a, b) => a + b, 0) / vector.components.length,
                min: Math.min(...vector.components),
                max: Math.max(...vector.components)
            }
        };
    }

    showExportModal(analysisData) {
        const modal = document.createElement('div');
        modal.className = 'export-modal-overlay';
        modal.innerHTML = `
            <div class="export-modal">
                <div class="export-header">
                    <h3>📤 Export Analysis</h3>
                    <button class="close-export">✕</button>
                </div>
                <div class="export-content">
                    <div class="export-options">
                        <button class="export-btn" data-format="json">📄 Export as JSON</button>
                        <button class="export-btn" data-format="csv">📊 Export as CSV</button>
                        <button class="export-btn" data-format="txt">📝 Export as Text Report</button>
                    </div>
                    <div class="export-preview">
                        <h4>Preview:</h4>
                        <pre id="export-preview-content">${JSON.stringify(analysisData, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupExportEventHandlers(modal, analysisData);
    }

    setupExportEventHandlers(modal, analysisData) {
        const closeBtn = modal.querySelector('.close-export');
        const exportBtns = modal.querySelectorAll('.export-btn');
        const previewContent = modal.querySelector('#export-preview-content');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.getAttribute('data-format');
                this.performExport(analysisData, format);
                document.body.removeChild(modal);
            });
        });
    }

    performExport(data, format) {
        let content, filename, mimeType;

        switch (format) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = `vector-analysis-${Date.now()}.json`;
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.convertToCSV(data);
                filename = `vector-analysis-${Date.now()}.csv`;
                mimeType = 'text/csv';
                break;
            case 'txt':
                content = this.convertToTextReport(data);
                filename = `vector-analysis-${Date.now()}.txt`;
                mimeType = 'text/plain';
                break;
            default:
                return;
        }

        this.downloadFile(content, filename, mimeType);
    }

    convertToCSV(data) {
        let csv = 'Vector ID,Magnitude,Entropy,Excitatory Quantum,Inhibitory Quantum\n';
        
        data.vectors.forEach(vector => {
            csv += `${vector.id},${vector.magnitude},${vector.entropy},${vector.quantums.excitatory},${vector.quantums.inhibitory}\n`;
        });

        return csv;
    }

    convertToTextReport(data) {
        let report = `Vector Analysis Report\n`;
        report += `Generated: ${data.timestamp}\n`;
        report += `Total Vectors: ${data.totalVectors}\n`;
        report += `Dimensions: ${data.globalStats.dimensions}\n\n`;
        
        report += `Global Statistics:\n`;
        report += `Average Magnitude: ${data.globalStats.avgMagnitude.toFixed(4)}\n`;
        report += `Average Entropy: ${data.globalStats.avgEntropy.toFixed(4)}\n\n`;

        if (data.selectedVectorAnalysis) {
            report += `Selected Vector Analysis (Vector ${data.selectedVectorAnalysis.id}):\n`;
            report += `Magnitude: ${data.selectedVectorAnalysis.magnitude.toFixed(4)}\n`;
            report += `Entropy: ${data.selectedVectorAnalysis.entropy.toFixed(4)}\n`;
            report += `Excitatory Quantum: ${data.selectedVectorAnalysis.quantums.excitatory.toFixed(4)}\n`;
            report += `Inhibitory Quantum: ${data.selectedVectorAnalysis.quantums.inhibitory.toFixed(4)}\n\n`;
        }

        report += `Detailed Vector Data:\n`;
        data.vectors.forEach(vector => {
            report += `Vector ${vector.id}: Magnitude=${vector.magnitude.toFixed(4)}, Entropy=${vector.entropy.toFixed(4)}\n`;
        });

        return report;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Relationship Analyzer - Handles vector relationship analysis
 */
class RelationshipAnalyzer {
    constructor(studio) {
        this.studio = studio;
        this.metrics = ['cosine', 'correlation', 'euclidean', 'manhattan', 'resonance', 'quantum'];
        this.currentMetric = 'cosine';
    }

    update() {
        const container = document.getElementById('relationships-enhanced');
        if (!container) {
            // Container doesn't exist yet - this is normal when called before DOM is ready
            return;
        }

        const { vectors } = this.studio.getState();
        if (!vectors || vectors.length < 2) {
            container.innerHTML = '<p>Need at least 2 vectors for relationship analysis.</p>';
            return;
        }

        container.innerHTML = this.generateRelationshipHTML();
        this.calculateRelationships();
        this.setupRelationshipControls();
    }

    generateRelationshipHTML() {
        return `
            <div class="relationship-controls">
                <div class="control-group">
                    <label for="similarity-metric">Similarity Metric:</label>
                    <select id="similarity-metric" class="mini-select">
                        <option value="cosine">Cosine Similarity</option>
                        <option value="correlation">Pearson Correlation</option>
                        <option value="euclidean">Euclidean Distance</option>
                        <option value="manhattan">Manhattan Distance</option>
                        <option value="resonance">Resonance Force</option>
                        <option value="quantum">Quantum Entanglement</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="similarity-threshold">Threshold:</label>
                    <input type="range" id="similarity-threshold" min="0" max="1" step="0.01" value="0.5">
                    <span id="threshold-value">0.5</span>
                </div>
            </div>
            
            <div class="relationship-visualization">
                <div class="similarity-matrix" id="similarity-matrix"></div>
                <div class="relationship-list" id="relationship-list"></div>
            </div>
        `;
    }

    calculateRelationships() {
        const { vectors } = this.studio.getState();
        const { forceCalculator } = this.studio.getModules();
        
        const relationships = [];
        const matrix = [];

        for (let i = 0; i < vectors.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < vectors.length; j++) {
                let similarity;
                switch (this.currentMetric) {
                    case 'correlation':
                        similarity = forceCalculator.correlation(vectors[i], vectors[j]);
                        break;
                    case 'euclidean':
                        similarity = 1 / (1 + forceCalculator.euclideanDistance(vectors[i], vectors[j]));
                        break;
                    case 'manhattan':
                        similarity = 1 / (1 + forceCalculator.manhattanDistance(vectors[i], vectors[j]));
                        break;
                    case 'resonance':
                        similarity = forceCalculator.resonanceForce(vectors[i], vectors[j]);
                        break;
                    case 'quantum':
                        similarity = forceCalculator.quantumEntanglement ? 
                            forceCalculator.quantumEntanglement(vectors[i], vectors[j]) : 
                            Math.abs(forceCalculator.correlation(vectors[i], vectors[j]));
                        break;
                    default:
                        similarity = forceCalculator.cosineSimilarity(vectors[i], vectors[j]);
                }
                
                matrix[i][j] = similarity;
                
                if (i < j) {
                    relationships.push({
                        vector1: vectors[i],
                        vector2: vectors[j],
                        similarity: Math.abs(similarity),
                        rawSimilarity: similarity
                    });
                }
            }
        }

        this.renderSimilarityMatrix(matrix, vectors);
        this.renderRelationshipList(relationships);
    }

    renderSimilarityMatrix(matrix, vectors) {
        const container = document.getElementById('similarity-matrix');
        if (!container) return;

        container.innerHTML = '<h6>📊 Similarity Matrix</h6>';

        // Check if D3.js is available
        if (!window.d3) {
            container.innerHTML += '<div class="matrix-fallback">D3.js not available. Matrix visualization disabled.</div>';
            return;
        }

        const size = Math.min(300, container.clientWidth || 300);
        const cellSize = size / vectors.length;

        const svg = window.d3.select(container)
            .append('svg')
            .attr('width', size)
            .attr('height', size);

        const colorScale = window.d3.scaleSequential(window.d3.interpolateRdYlBu)
            .domain([-1, 1]);

        for (let i = 0; i < vectors.length; i++) {
            for (let j = 0; j < vectors.length; j++) {
                svg.append('rect')
                    .attr('x', j * cellSize)
                    .attr('y', i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', colorScale(matrix[i][j]))
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1);

                if (cellSize > 20) {
                    svg.append('text')
                        .attr('x', j * cellSize + cellSize/2)
                        .attr('y', i * cellSize + cellSize/2)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', Math.abs(matrix[i][j]) > 0.5 ? 'white' : 'black')
                        .attr('font-size', '10px')
                        .text(matrix[i][j].toFixed(2));
                }
            }
        }
    }

    renderRelationshipList(relationships) {
        const container = document.getElementById('relationship-list');
        if (!container) return;

        relationships.sort((a, b) => b.similarity - a.similarity);
        
        const threshold = parseFloat(document.getElementById('similarity-threshold')?.value || 0.5);
        const filteredRelationships = relationships.filter(r => r.similarity >= threshold);

        container.innerHTML = `
            <h6>🔗 Vector Relationships (${filteredRelationships.length})</h6>
            <div class="relationships-list">
                ${filteredRelationships.map(rel => `
                    <div class="relationship-item">
                        <div class="relationship-vectors">
                            <span class="vector-id">V${rel.vector1.id}</span>
                            <span class="relationship-arrow">↔</span>
                            <span class="vector-id">V${rel.vector2.id}</span>
                        </div>
                        <div class="relationship-strength">
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${rel.similarity * 100}%"></div>
                            </div>
                            <span class="strength-value">${rel.rawSimilarity.toFixed(3)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupRelationshipControls() {
        const metricSelect = document.getElementById('similarity-metric');
        const thresholdSlider = document.getElementById('similarity-threshold');
        const thresholdValue = document.getElementById('threshold-value');

        if (metricSelect) {
            metricSelect.addEventListener('change', (e) => {
                this.currentMetric = e.target.value;
                this.calculateRelationships();
            });
        }

        if (thresholdSlider && thresholdValue) {
            thresholdSlider.addEventListener('input', (e) => {
                thresholdValue.textContent = e.target.value;
                this.calculateRelationships();
            });
        }
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Clustering Analyzer - Handles vector clustering analysis
 */
class ClusteringAnalyzer {
    constructor(studio) {
        this.studio = studio;
        this.algorithms = ['kmeans', 'hierarchical', 'dbscan'];
        this.currentAlgorithm = 'kmeans';
        this.numClusters = 3;
    }

    update() {
        console.log('🔍 ClusteringAnalyzer.update() called');
        const container = document.getElementById('clusters-enhanced');
        if (!container) {
            console.warn('clusters-enhanced container not found');
            return;
        }

        const { vectors } = this.studio.getState();
        console.log('Vectors available for clustering:', vectors?.length || 0);
        
        if (!vectors || vectors.length < 2) {
            console.log('Not enough vectors for clustering');
            container.innerHTML = '<p>Need at least 2 vectors for clustering analysis.</p>';
            return;
        }

        const hasControls = container.querySelector('.clustering-controls');
        console.log('Container has controls:', !!hasControls);
        
        if (!hasControls) {
            console.log('Generating clustering HTML and setting up controls...');
            container.innerHTML = this.generateClusteringHTML();
            this.setupClusteringControls();
        } else {
            console.log('Controls already exist, skipping setup');
        }
        
        console.log('Performing initial clustering...');
        this.performClustering();
    }

    generateClusteringHTML() {
        return `
            <div class="clustering-controls">
                <div class="control-group">
                    <label for="clustering-algorithm">Algorithm:</label>
                    <select id="clustering-algorithm" class="mini-select">
                        <option value="kmeans">K-Means</option>
                        <option value="hierarchical">Hierarchical</option>
                        <option value="dbscan">DBSCAN</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="num-clusters">Number of Clusters:</label>
                    <input type="range" id="num-clusters" min="2" max="10" value="3">
                    <span id="clusters-value">3</span>
                </div>
                <button id="run-clustering" class="btn-compact">🔄 Run Clustering</button>
            </div>
            
            <div class="clustering-results">
                <div class="cluster-summary" id="cluster-summary"></div>
                <div class="cluster-details" id="cluster-details"></div>
            </div>
        `;
    }

    performClustering() {
        console.log('🔄 Starting clustering analysis...');
        try {
            const { vectors } = this.studio.getState();
            if (!vectors || vectors.length < 2) {
                console.warn('Not enough vectors for clustering:', vectors?.length || 0);
                return;
            }
            
            console.log('Clustering', vectors.length, 'vectors into', this.numClusters, 'clusters');
            const clusters = this.kMeansClustering(vectors, this.numClusters);
            console.log('Clustering complete. Results:', clusters);
            this.renderClusteringResults(clusters);
        } catch (error) {
            console.error('Error during clustering:', error);
            const container = document.getElementById('clusters-enhanced');
            if (container) {
                container.innerHTML = `<div class="error-message">Clustering failed: ${error.message}</div>`;
            }
        }
    }

    kMeansClustering(vectors, k) {
        // Simple k-means implementation
        const clusters = Array.from({ length: k }, () => ({ centroid: null, vectors: [] }));
        
        // Initialize centroids randomly
        for (let i = 0; i < k; i++) {
            const randomVector = vectors[Math.floor(Math.random() * vectors.length)];
            clusters[i].centroid = [...randomVector.components];
        }
        
        let changed = true;
        let iterations = 0;
        const maxIterations = 100;
        
        while (changed && iterations < maxIterations) {
            changed = false;
            
            // Clear clusters
            clusters.forEach(cluster => cluster.vectors = []);
            
            // Assign vectors to closest centroid
            vectors.forEach(vector => {
                let minDistance = Infinity;
                let closestCluster = 0;
                
                clusters.forEach((cluster, i) => {
                    const distance = this.euclideanDistance(vector.components, cluster.centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCluster = i;
                    }
                });
                
                clusters[closestCluster].vectors.push(vector);
            });
            
            // Update centroids
            clusters.forEach(cluster => {
                if (cluster.vectors.length > 0) {
                    const newCentroid = new Array(cluster.vectors[0].components.length).fill(0);
                    cluster.vectors.forEach(vector => {
                        vector.components.forEach((comp, i) => {
                            newCentroid[i] += comp / cluster.vectors.length;
                        });
                    });
                    
                    const centroidDistance = this.euclideanDistance(cluster.centroid, newCentroid);
                    if (centroidDistance > 0.001) {
                        changed = true;
                    }
                    cluster.centroid = newCentroid;
                }
            });
            
            iterations++;
        }
        
        return clusters;
    }

    euclideanDistance(a, b) {
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    }

    renderClusteringResults(clusters) {
        console.log('📊 Rendering clustering results for', clusters.length, 'clusters');
        const summaryContainer = document.getElementById('cluster-summary');
        const detailsContainer = document.getElementById('cluster-details');
        
        console.log('Containers found:', {
            summary: !!summaryContainer,
            details: !!detailsContainer
        });
        
        if (!summaryContainer || !detailsContainer) {
            console.error('Missing clustering result containers:', {
                summary: summaryContainer,
                details: detailsContainer
            });
            return;
        }

        // Cluster summary
        summaryContainer.innerHTML = `
            <h6>📊 Clustering Summary</h6>
            <div class="cluster-stats">
                <div class="stat-item">
                    <span class="stat-label">Clusters:</span>
                    <span class="stat-value">${clusters.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Algorithm:</span>
                    <span class="stat-value">${this.currentAlgorithm}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Vectors:</span>
                    <span class="stat-value">${clusters.reduce((sum, c) => sum + c.vectors.length, 0)}</span>
                </div>
            </div>
        `;

        // Cluster details
        const clusterColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        
        detailsContainer.innerHTML = `
            <h6>🎯 Cluster Details</h6>
            <div class="clusters-list">
                ${clusters.map((cluster, i) => `
                    <div class="cluster-item">
                        <div class="cluster-header">
                            <div class="cluster-color" style="background-color: ${clusterColors[i % clusterColors.length]}"></div>
                            <span class="cluster-title">Cluster ${i + 1}</span>
                            <span class="cluster-size">${cluster.vectors.length} vectors</span>
                        </div>
                        <div class="cluster-vectors">
                            ${cluster.vectors.map(v => `<span class="vector-chip">V${v.id}</span>`).join('')}
                        </div>
                        <div class="cluster-centroid">
                            <strong>Centroid:</strong> [${cluster.centroid.map(c => c.toFixed(3)).join(', ')}]
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupClusteringControls() {
        console.log('🎛️ Setting up clustering controls...');
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const algorithmSelect = document.getElementById('clustering-algorithm');
            const numClustersSlider = document.getElementById('num-clusters');
            const clustersValue = document.getElementById('clusters-value');
            const runButton = document.getElementById('run-clustering');

            console.log('Controls found (after timeout):', {
                algorithm: !!algorithmSelect,
                slider: !!numClustersSlider,
                value: !!clustersValue,
                button: !!runButton
            });

            // Debug: Check if there are multiple buttons with same ID
            const allRunButtons = document.querySelectorAll('#run-clustering');
            console.log('Number of run-clustering buttons found:', allRunButtons.length);

            if (algorithmSelect) {
                algorithmSelect.addEventListener('change', (e) => {
                    console.log('Algorithm changed to:', e.target.value);
                    this.currentAlgorithm = e.target.value;
                });
            }

            if (numClustersSlider && clustersValue) {
                numClustersSlider.addEventListener('input', (e) => {
                    this.numClusters = parseInt(e.target.value);
                    clustersValue.textContent = this.numClusters;
                    console.log('Number of clusters changed to:', this.numClusters);
                });
            }

            if (runButton) {
                // Try multiple ways to attach the event listener
                console.log('Attempting to attach click handler...');
                
                // Method 1: addEventListener
                runButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Run clustering button clicked! (method 1)');
                    this.performClustering();
                });
                
                // Method 2: onclick property
                runButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Run clustering button clicked! (method 2)');
                    this.performClustering();
                };
                
                // Method 3: Test if button is clickable at all
                runButton.addEventListener('mousedown', () => {
                    console.log('🖱️ Run clustering button mousedown detected');
                });
                
                runButton.addEventListener('mouseup', () => {
                    console.log('🖱️ Run clustering button mouseup detected');
                });
                
                console.log('✅ Run clustering button handler registered');
                console.log('Button properties:', {
                    id: runButton.id,
                    className: runButton.className,
                    disabled: runButton.disabled,
                    style: runButton.style.cssText,
                    offsetParent: runButton.offsetParent
                });
            } else {
                console.error('❌ Run clustering button not found!');
                // Try to find it by class or other selector
                const buttonByClass = document.querySelector('.btn-compact');
                console.log('Button found by class:', !!buttonByClass);
            }
        }, 100);
    }

    dispose() {
        // Cleanup
    }
}

/**
 * Statistics Analyzer - Handles general statistics analysis
 */
class StatisticsAnalyzer {
    constructor(studio) {
        this.studio = studio;
    }

    update() {
        const container = document.getElementById('statistics-tab');
        if (!container) return;

        const { vectors } = this.studio.getState();
        if (!vectors || vectors.length === 0) {
            container.innerHTML = '<p>No vectors available for analysis.</p>';
            return;
        }

        container.innerHTML = this.generateStatisticsHTML();
        this.calculateGlobalStatistics();
    }

    generateStatisticsHTML() {
        return `
            <div class="global-statistics">
                <h6>📈 Global Vector Statistics</h6>
                <div class="stats-grid" id="global-stats-grid"></div>
            </div>
            
            <div class="distribution-analysis">
                <h6>📊 Distribution Analysis</h6>
                <div class="distribution-charts" id="distribution-charts"></div>
            </div>
            
            <div class="correlation-analysis">
                <h6>🔗 Dimension Correlation Analysis</h6>
                <div class="correlation-heatmap" id="correlation-heatmap"></div>
            </div>
        `;
    }

    calculateGlobalStatistics() {
        const { vectors } = this.studio.getState();
        const { forceCalculator } = this.studio.getModules();
        
        // Calculate global statistics
        const stats = this.computeGlobalStats(vectors, forceCalculator);
        this.renderGlobalStats(stats);
        this.renderDistributionAnalysis(vectors);
        this.renderCorrelationAnalysis(vectors);
    }

    computeGlobalStats(vectors, forceCalculator) {
        const magnitudes = vectors.map(v => forceCalculator.magnitude(v));
        const entropies = vectors.map(v => forceCalculator.informationEntropy(v));
        const allComponents = vectors.flatMap(v => v.components);
        
        return {
            totalVectors: vectors.length,
            avgMagnitude: magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length,
            stdMagnitude: this.standardDeviation(magnitudes),
            avgEntropy: entropies.reduce((a, b) => a + b, 0) / entropies.length,
            stdEntropy: this.standardDeviation(entropies),
            globalMean: allComponents.reduce((a, b) => a + b, 0) / allComponents.length,
            globalStd: this.standardDeviation(allComponents),
            minComponent: Math.min(...allComponents),
            maxComponent: Math.max(...allComponents),
            sparsity: allComponents.filter(c => Math.abs(c) < 0.001).length / allComponents.length
        };
    }

    standardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    renderGlobalStats(stats) {
        const container = document.getElementById('global-stats-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card-global">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.totalVectors}</div>
                    <div class="stat-label">Total Vectors</div>
                </div>
            </div>
            
            <div class="stat-card-global">
                <div class="stat-icon">📏</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.avgMagnitude.toFixed(3)}</div>
                    <div class="stat-label">Avg Magnitude</div>
                    <div class="stat-detail">±${stats.stdMagnitude.toFixed(3)}</div>
                </div>
            </div>
            
            <div class="stat-card-global">
                <div class="stat-icon">🌊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.avgEntropy.toFixed(3)}</div>
                    <div class="stat-label">Avg Entropy</div>
                    <div class="stat-detail">±${stats.stdEntropy.toFixed(3)}</div>
                </div>
            </div>
            
            <div class="stat-card-global">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                    <div class="stat-value">${(stats.sparsity * 100).toFixed(1)}%</div>
                    <div class="stat-label">Global Sparsity</div>
                </div>
            </div>
            
            <div class="stat-card-global">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.globalMean.toFixed(3)}</div>
                    <div class="stat-label">Global Mean</div>
                    <div class="stat-detail">±${stats.globalStd.toFixed(3)}</div>
                </div>
            </div>
            
            <div class="stat-card-global">
                <div class="stat-icon">📉</div>
                <div class="stat-content">
                    <div class="stat-value">[${stats.minComponent.toFixed(2)}, ${stats.maxComponent.toFixed(2)}]</div>
                    <div class="stat-label">Value Range</div>
                </div>
            </div>
        `;
    }

    renderDistributionAnalysis(vectors) {
        const container = document.getElementById('distribution-charts');
        if (!container || !window.d3) return;

        const allComponents = vectors.flatMap(v => v.components);
        
        container.innerHTML = '<div class="distribution-chart" id="component-distribution"></div>';
        
        const chartContainer = document.getElementById('component-distribution');
        const width = chartContainer.clientWidth || 400;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };

        const svg = window.d3.select(chartContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const bins = window.d3.histogram()
            .domain(window.d3.extent(allComponents))
            .thresholds(20)(allComponents);

        const xScale = window.d3.scaleLinear()
            .domain(window.d3.extent(allComponents))
            .range([margin.left, width - margin.right]);

        const yScale = window.d3.scaleLinear()
            .domain([0, window.d3.max(bins, d => d.length)])
            .range([height - margin.bottom, margin.top]);

        svg.selectAll('.bar')
            .data(bins)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.x0))
            .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr('y', d => yScale(d.length))
            .attr('height', d => height - margin.bottom - yScale(d.length))
            .attr('fill', '#4ecdc4')
            .attr('opacity', 0.8);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(window.d3.axisBottom(xScale));

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(window.d3.axisLeft(yScale));
    }

    renderCorrelationAnalysis(vectors) {
        const container = document.getElementById('correlation-heatmap');
        if (!container || !window.d3 || vectors.length === 0) return;

        const dimensions = vectors[0].components.length;
        if (dimensions > 20) {
            container.innerHTML = '<p>Too many dimensions for correlation heatmap display.</p>';
            return;
        }

        const correlationMatrix = this.calculateCorrelationMatrix(vectors);
        const size = Math.min(400, container.clientWidth);
        const cellSize = size / dimensions;

        container.innerHTML = '';
        const svg = window.d3.select(container)
            .append('svg')
            .attr('width', size)
            .attr('height', size);

        const colorScale = window.d3.scaleSequential(window.d3.interpolateRdBu)
            .domain([-1, 1]);

        for (let i = 0; i < dimensions; i++) {
            for (let j = 0; j < dimensions; j++) {
                svg.append('rect')
                    .attr('x', j * cellSize)
                    .attr('y', i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', colorScale(correlationMatrix[i][j]))
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1);

                if (cellSize > 15) {
                    svg.append('text')
                        .attr('x', j * cellSize + cellSize/2)
                        .attr('y', i * cellSize + cellSize/2)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', Math.abs(correlationMatrix[i][j]) > 0.5 ? 'white' : 'black')
                        .attr('font-size', '8px')
                        .text(correlationMatrix[i][j].toFixed(2));
                }
            }
        }
    }

    calculateCorrelationMatrix(vectors) {
        const dimensions = vectors[0].components.length;
        const matrix = [];

        for (let i = 0; i < dimensions; i++) {
            matrix[i] = [];
            for (let j = 0; j < dimensions; j++) {
                const dimI = vectors.map(v => v.components[i]);
                const dimJ = vectors.map(v => v.components[j]);
                matrix[i][j] = this.correlation(dimI, dimJ);
            }
        }

        return matrix;
    }

    correlation(x, y) {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;
        
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (let i = 0; i < n; i++) {
            const deltaX = x[i] - meanX;
            const deltaY = y[i] - meanY;
            numerator += deltaX * deltaY;
            denomX += deltaX * deltaX;
            denomY += deltaY * deltaY;
        }
        
        return numerator / Math.sqrt(denomX * denomY);
    }

    dispose() {
        // Cleanup
    }
} 