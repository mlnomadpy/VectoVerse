import { Constants } from './Constants.js';
// import { ButtonManager } from './ButtonManager.js';
// import { TabManager } from './TabManager.js';
// import { ExportManager } from './ExportManager.js';
// import { MathRenderer } from './MathRenderer.js';
// import { ControlManager } from './ControlManager.js';

export class UIController {
    constructor(framework) {
        this.framework = framework;
        this.d3 = window.d3; // Get D3 from global scope
        // this.buttonManager = new ButtonManager(framework);
        // this.tabManager = new TabManager(framework);
        // this.exportManager = new ExportManager(framework);
        // this.mathRenderer = new MathRenderer(framework);
        // this.controlManager = new ControlManager(framework);
    }

    setupControls() {
        this.setupDimensionsControl();
        this.setupVectorsControl();
        this.setupButtons();
        this.setupThemeSwitcher();
        this.setupHelpModal();
        this.setupAnalysisModal();
        this.setupUploadHelpModal();
        this.setupActivationHelpModal();
        this.setupHelpSystem();
        
        this.framework.eventBus.on('stateChanged', (eventData) => {
            // Only update vector details if selection changed or vector properties changed
            if (!eventData || eventData.reason === 'vectorSelected' || 
                eventData.reason === 'vectorColorChanged' || 
                eventData.reason === 'vectorScaleChanged' ||
                eventData.fullRender) {
                this.updateVectorDetails();
            }
            
            // Only update controls if necessary
            if (!eventData || eventData.fullRender || eventData.reason === 'vectorsGenerated') {
                this.updateControls();
            }
        });
        
        this.updateControls();
    }

    setupDimensionsControl() {
        const dimensionsSlider = document.getElementById('dimensions');
        const dimValue = document.getElementById('dim-value');

        if (dimensionsSlider) {
            dimensionsSlider.addEventListener('input', (e) => {
                const dims = parseInt(e.target.value, 10);
                dimValue.textContent = `${dims}D`;
                this.framework.updateConfig('dimensions', dims);
            });
        }
    }

    setupVectorsControl() {
        const vectorsSlider = document.getElementById('vectors');
        const vecValue = document.getElementById('vec-value');

        if (vectorsSlider) {
            vectorsSlider.addEventListener('input', (e) => {
                const numVectors = parseInt(e.target.value, 10);
                vecValue.textContent = numVectors;
                this.framework.updateConfig('numVectors', numVectors);
            });
        }
    }

    setupButtons() {
        document.getElementById('regenerate')?.addEventListener('click', () => this.framework.stateManager.generateVectors());
        
        const toggleForcesButton = document.getElementById('toggle-forces');
        if (toggleForcesButton) {
            toggleForcesButton.addEventListener('click', (e) => {
                const state = e.currentTarget.dataset.state === 'on' ? 'off' : 'on';
                e.currentTarget.dataset.state = state;
                const stateSpan = e.currentTarget.querySelector('.btn-state');
                if (stateSpan) {
                    stateSpan.textContent = state.toUpperCase();
                }
                this.framework.updateConfig('showForces', state === 'on');
            });
        }
        
        document.getElementById('add-input-vector')?.addEventListener('click', () => this.showAddVectorModal());
        document.getElementById('export-json')?.addEventListener('click', () => this.framework.modules.fileHandler.exportStateToJson());
        
        const vectorFileInput = document.getElementById('vector-file');
        if (vectorFileInput) {
            vectorFileInput.addEventListener('change', (e) => this.framework.modules.fileHandler.handleFileUpload(e));
        }
    }

    setupThemeSwitcher() {
        const themeSwitcher = document.querySelector('.theme-switcher');
        // On load, apply saved theme
        const savedTheme = localStorage.getItem('vectoverse-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeSwitcher) themeSwitcher.textContent = '🌑';
        } else {
            document.body.classList.remove('light-theme');
            if (themeSwitcher) themeSwitcher.textContent = '🌙';
        }
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                themeSwitcher.textContent = isLight ? '🌑' : '🌙';
                localStorage.setItem('vectoverse-theme', isLight ? 'light' : 'dark');
            });
        }
    }

    setupHelpModal() {
        const modal = document.getElementById('tutorial-modal');
        const showButton = document.getElementById('show-help');
        const closeButton = modal?.querySelector('.close-button');
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Tutorial');
        }
        showButton?.addEventListener('click', () => {
            modal?.classList.add('active');
            setTimeout(() => {
                const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                if (focusable[0]) focusable[0].focus();
            }, 50);
        });
        closeButton?.addEventListener('click', () => modal?.classList.remove('active'));
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    setupAnalysisModal() {
        const modal = document.getElementById('analysis-modal');
        const showButton = document.getElementById('run-analysis');
        const closeButton = modal?.querySelector('.close-button');
        const analysisTypeSelect = document.getElementById('analysis-type');
        const kmeansOptions = document.getElementById('kmeans-options');
        const runButton = document.getElementById('run-selected-analysis');
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Advanced Analysis');
        }
        showButton?.addEventListener('click', () => {
            modal?.classList.add('active');
            setTimeout(() => {
                const focusable = modal.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])');
                if (focusable[0]) focusable[0].focus();
            }, 50);
        });
        closeButton?.addEventListener('click', () => modal?.classList.remove('active'));
        analysisTypeSelect?.addEventListener('change', (e) => {
            if (e.target.value === 'kmeans') {
                kmeansOptions.style.display = 'flex';
            } else {
                kmeansOptions.style.display = 'none';
            }
        });
        runButton?.addEventListener('click', () => {
            const type = analysisTypeSelect.value;
            this.runAnalysis(type);
        });
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    setupUploadHelpModal() {
        const modal = document.getElementById('upload-help-modal');
        const showButton = document.getElementById('show-upload-help');
        const closeButton = modal?.querySelector('.close-button');
        
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Upload Format Guide');
        }
        
        showButton?.addEventListener('click', () => {
            modal?.classList.add('active');
            setTimeout(() => {
                const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                if (focusable[0]) focusable[0].focus();
            }, 50);
        });
        
        closeButton?.addEventListener('click', () => modal?.classList.remove('active'));
        
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    setupActivationHelpModal() {
        const modal = document.getElementById('activation-help-modal');
        const showButton = document.getElementById('show-activation-help');
        const closeButton = modal?.querySelector('.close-button');
        
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Activation Functions Guide');
        }
        
        showButton?.addEventListener('click', () => {
            modal?.classList.add('active');
            setTimeout(() => {
                const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                if (focusable[0]) focusable[0].focus();
            }, 50);
        });
        
        closeButton?.addEventListener('click', () => modal?.classList.remove('active'));
        
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    setupHelpSystem() {
        const helpButton = document.querySelector('[data-action="help"]');
        if (helpButton) {
            helpButton.addEventListener('click', () => this.showComprehensiveHelp());
        }
    }

    showComprehensiveHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'VectoVerse Help & Features');
        
        modal.innerHTML = `
            <div class="modal-content help-modal">
                <div class="help-header">
                    <h3>🚀 VectoVerse - Complete Guide</h3>
                    <button class="close-button" aria-label="Close help">&times;</button>
                </div>
                
                <div class="help-content">
                    <div class="help-tabs">
                        <button class="help-tab active" data-tab="features">✨ Features</button>
                        <button class="help-tab" data-tab="keyboard">⌨️ Shortcuts</button>
                        <button class="help-tab" data-tab="analysis">📊 Analysis</button>
                        <button class="help-tab" data-tab="export">💾 Export</button>
                        <button class="help-tab" data-tab="accessibility">♿ Accessibility</button>
                    </div>
                    
                    <div class="help-panel active" data-panel="features">
                        <h4>Core Features</h4>
                        <ul class="feature-list">
                            <li><strong>Interactive Vector Visualization:</strong> Click, drag, and explore high-dimensional vectors in 2D/3D space</li>
                            <li><strong>Custom Vector Input:</strong> Add your own vectors with the "Add Vector" button</li>
                            <li><strong>Force Visualization:</strong> Toggle attractive/repulsive forces between vectors</li>
                            <li><strong>Real-time Controls:</strong> Adjust dimensions, vector count, and visualization parameters</li>
                            <li><strong>File Upload/Export:</strong> Import CSV data and export in multiple formats</li>
                            <li><strong>Theme Switching:</strong> Light/dark mode with persistent preferences</li>
                            <li><strong>Responsive Design:</strong> Optimized for desktop, tablet, and mobile devices</li>
                        </ul>
                    </div>
                    
                    <div class="help-panel" data-panel="keyboard">
                        <h4>Keyboard Navigation</h4>
                        <div class="shortcut-grid">
                            <div class="shortcut-item"><kbd>Ctrl+G</kbd> Generate new vectors</div>
                            <div class="shortcut-item"><kbd>Ctrl+R</kbd> Reset visualization</div>
                            <div class="shortcut-item"><kbd>Ctrl+E</kbd> Export options</div>
                            <div class="shortcut-item"><kbd>Ctrl+A</kbd> Analysis modal</div>
                            <div class="shortcut-item"><kbd>Arrow Keys</kbd> Navigate vectors</div>
                            <div class="shortcut-item"><kbd>Enter/Space</kbd> Select vector</div>
                            <div class="shortcut-item"><kbd>Escape</kbd> Close modals</div>
                            <div class="shortcut-item"><kbd>?</kbd> Show shortcuts</div>
                        </div>
                    </div>
                    
                    <div class="help-panel" data-panel="analysis">
                        <h4>Advanced Analysis</h4>
                        <div class="analysis-features">
                            <div class="analysis-item">
                                <h5>📈 PCA (Principal Component Analysis)</h5>
                                <p>Reduces dimensionality while preserving variance. Shows explained variance and projected coordinates.</p>
                            </div>
                            <div class="analysis-item">
                                <h5>🔍 t-SNE</h5>
                                <p>Non-linear dimensionality reduction for visualization. Great for finding clusters and patterns.</p>
                            </div>
                            <div class="analysis-item">
                                <h5>📊 K-Means Clustering</h5>
                                <p>Groups vectors into clusters. Shows silhouette score, cluster assignments, and centroids.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-panel" data-panel="export">
                        <h4>Export & Import Options</h4>
                        <div class="export-options">
                            <div class="export-format">
                                <h5>📋 CSV Format</h5>
                                <p>Comprehensive data with headers: vector ID, type, position, magnitude, entropy, and all components</p>
                            </div>
                            <div class="export-format">
                                <h5>📄 JSON Format</h5>
                                <p>Complete session data including metadata, configuration, and analysis results</p>
                            </div>
                            <div class="export-format">
                                <h5>🖼️ Visual Export</h5>
                                <p>High-resolution PNG and scalable SVG for publications and presentations</p>
                            </div>
                            <div class="export-format">
                                <h5>📈 Analysis Results</h5>
                                <p>Export PCA, t-SNE, and clustering results in multiple formats</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-panel" data-panel="accessibility">
                        <h4>Accessibility Features</h4>
                        <div class="accessibility-features">
                            <div class="a11y-item">
                                <h5>🔊 Screen Reader Support</h5>
                                <p>Full ARIA labels, live regions for announcements, and descriptive content</p>
                            </div>
                            <div class="a11y-item">
                                <h5>⌨️ Keyboard Navigation</h5>
                                <p>Complete keyboard control, focus management, and modal focus trapping</p>
                            </div>
                            <div class="a11y-item">
                                <h5>🎨 High Contrast</h5>
                                <p>Automatic detection and enhanced colors for better visibility</p>
                            </div>
                            <div class="a11y-item">
                                <h5>🎯 Reduced Motion</h5>
                                <p>Respects user preferences for reduced motion and animations</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="help-footer">
                    <p><strong>Performance Tips:</strong> The app automatically optimizes for your device. For large datasets (>100 vectors), consider enabling performance mode in settings.</p>
                    <p><strong>Need Help?</strong> Use the error reporting system if you encounter issues. All errors are logged and can be exported for debugging.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup tab functionality
        const tabs = modal.querySelectorAll('.help-tab');
        const panels = modal.querySelectorAll('.help-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                // Update active states
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                modal.querySelector(`[data-panel="${targetPanel}"]`).classList.add('active');
            });
        });

        // Close functionality
        modal.querySelector('.close-button').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Focus the modal
        modal.querySelector('.help-tabs .help-tab').focus();
    }

    async runAnalysis(type) {
        const resultsContainer = document.getElementById('analysis-results');
        const runButton = document.getElementById('run-selected-analysis');
        const vectors = this.framework.getState().vectors;
        
        if (vectors.length < 2) {
            resultsContainer.innerHTML = `<p style="color: orange;">Need at least 2 vectors for analysis.</p>`;
            return;
        }
        
        // Show loading state
        runButton.disabled = true;
        runButton.classList.add('loading');
        resultsContainer.innerHTML = `
            <div class="loading-analysis">
                <div class="loading-spinner"></div>
                <p>Running ${type.toUpperCase()} analysis...</p>
            </div>
        `;
        
        let result;
        try {
            switch (type) {
                case 'pca':
                    result = await this.framework.modules.analysisEngine.performPCA(vectors);
                    break;
                case 'tsne':
                    result = await this.framework.modules.analysisEngine.performTSNE(vectors);
                    break;
                case 'kmeans':
                    const k = parseInt(document.getElementById('kmeans-k').value, 10);
                    result = await this.framework.modules.analysisEngine.performKMeans(vectors, k);
                    break;
                default:
                    throw new Error(`Unknown analysis type: ${type}`);
            }
            this.displayAnalysisResults(result);
            this.showToast(`${type.toUpperCase()} analysis completed successfully!`, 'success');
        } catch (error) {
            resultsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            this.showToast(`Analysis failed: ${error.message}`, 'error');
        } finally {
            // Remove loading state
            runButton.disabled = false;
            runButton.classList.remove('loading');
        }
    }

    displayAnalysisResults(result) {
        const resultsContainer = document.getElementById('analysis-results');
        let html = `
            <div class="analysis-header">
                <h4>${result.type.toUpperCase()} Results</h4>
                <small>Completed at ${new Date(result.timestamp).toLocaleTimeString()}</small>
            </div>
        `;

        if (result.type === 'pca') {
            html += `
                <div class="analysis-stats">
                    <div class="stat-card">
                        <strong>Explained Variance:</strong> 
                        ${result.explainedVariance.map(v => (v * 100).toFixed(1) + '%').join(', ')}
                    </div>
                    <div class="stat-card">
                        <strong>Total Variance:</strong> 
                        ${(result.explainedVariance.reduce((sum, v) => sum + v, 0) * 100).toFixed(1)}%
                    </div>
                </div>
                <details>
                    <summary>Projected Data (first 5 points)</summary>
                    <ul class="data-list">
                        ${result.data.slice(0, 5).map(point => 
                            `<li>[${point.map(p => p.toFixed(4)).join(', ')}]</li>`
                        ).join('')}
                    </ul>
                </details>
            `;
        } else if (result.type === 'tsne') {
            html += `
                <div class="analysis-stats">
                    <div class="stat-card">
                        <strong>Perplexity:</strong> ${result.parameters.perplexity || 30}
                    </div>
                    <div class="stat-card">
                        <strong>Dimensions:</strong> ${result.parameters.dim || 2}
                    </div>
                </div>
                <details>
                    <summary>Embedding (first 5 points)</summary>
                    <ul class="data-list">
                        ${result.data.slice(0, 5).map(point => 
                            `<li>[${point.map(p => p.toFixed(4)).join(', ')}]</li>`
                        ).join('')}
                    </ul>
                </details>
            `;
        } else if (result.type === 'kmeans') {
            html += `
                <div class="analysis-stats">
                    <div class="stat-card"><strong>Clusters:</strong> ${result.data.k}</div>
                    <div class="stat-card"><strong>Iterations:</strong> ${result.data.iterations}</div>
                    <div class="stat-card"><strong>Converged:</strong> ${result.data.converged ? '✓' : '✗'}</div>
                    <div class="stat-card"><strong>Silhouette Score:</strong> ${result.data.silhouetteScore.toFixed(3)}</div>
                </div>
                <div class="cluster-breakdown">
                    <h5>Cluster Distribution:</h5>
                    ${result.data.clusters.map((cluster, i) => `
                        <div class="cluster-item">
                            <span class="cluster-color" style="background: hsl(${i * 60}, 70%, 60%)"></span>
                            Cluster ${i + 1}: ${cluster.size} vectors (${(cluster.size / result.originalVectors.length * 100).toFixed(1)}%)
                        </div>
                    `).join('')}
                </div>
            `;
        }

        resultsContainer.innerHTML = html;

        // Emit event to update visualization
        this.framework.eventBus.emit('analysisCompleted', result);
    }

    updateVectorDetails() {
        const selectedVector = this.framework.stateManager.getSelectedVector();
        const detailsContainer = document.getElementById('vector-details-content');
        
        if (!detailsContainer) return;

        if (selectedVector === null) {
            detailsContainer.innerHTML = `<div class="placeholder">Click on a vector to see its detailed properties and relationships.</div>`;
            return;
        }

        const template = document.getElementById('vector-details-template');
        if (!template) return;

        const clone = template.content.cloneNode(true);
        
        const forceCalculator = this.framework.getModules().forceCalculator;
        const quantums = forceCalculator.getInformationQuantums(selectedVector);
        let charge = "Neutral (Balanced)";
        if (quantums.excitatory > quantums.inhibitory) charge = "Positive (Excitatory)";
        else if (quantums.inhibitory > quantums.excitatory) charge = "Negative (Inhibitory)";

        const chargeIndicator = clone.querySelector('.charge-indicator');
        if (chargeIndicator) {
            if (charge.includes('Positive')) chargeIndicator.style.background = '#4ecdc4';
            else if (charge.includes('Negative')) chargeIndicator.style.background = '#f06292';
            else chargeIndicator.style.background = '#6c757d';
        }

        clone.querySelector('.vector-name').textContent = `Vector ${selectedVector.id}`;
        clone.querySelector('#template-magnitude').textContent = forceCalculator.magnitude(selectedVector).toFixed(4);
        clone.querySelector('#template-entropy').textContent = forceCalculator.informationEntropy(selectedVector).toFixed(4);
        clone.querySelector('#template-dimensions').textContent = selectedVector.components.length;

        this.renderComponentChart(clone.querySelector('#template-components-chart'), selectedVector.components);
        this.renderStatsList(clone.querySelector('#template-stats-list'), forceCalculator.getVectorStatistics(selectedVector));

        const relationshipsList = clone.querySelector('#template-relationships-list');
        const sortMetricSelect = clone.querySelector('#relationship-sort-metric');

        if (relationshipsList && sortMetricSelect) {
            const similarities = this.calculateSimilarities(selectedVector);
            
            const renderRelationships = () => {
                const metric = sortMetricSelect.value;
                
                // For distance, smaller is better, so we reverse the sort order.
                if (metric === 'distance') {
                    similarities.sort((a, b) => a[metric] - b[metric]);
                } else {
                    similarities.sort((a, b) => b[metric] - a[metric]);
                }

                relationshipsList.innerHTML = similarities.slice(0, 5).map(s => `
                    <div class="relationship-item">
                        <div class="relationship-target">vs V${s.index}</div>
                        <div class="relationship-scores">
                            <div>Resonance: <span class="score-value">${s.resonance.toFixed(3)}</span></div>
                            <div>Similarity: <span class="score-value">${s.similarity.toFixed(3)}</span></div>
                            <div>Correlation: <span class="score-value">${s.correlation.toFixed(3)}</span></div>
                            <div>Distance: <span class="score-value">${s.distance.toFixed(3)}</span></div>
                        </div>
                    </div>
                `).join('');
            };

            sortMetricSelect.addEventListener('change', renderRelationships);
            renderRelationships(); // Initial render
        }
        
        detailsContainer.innerHTML = '';
        detailsContainer.appendChild(clone);
    }

    renderComponentChart(container, components) {
        if (!container) return;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;

        const svg = this.d3.select(container).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${container.clientWidth} ${container.clientHeight}`)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = this.d3.scaleBand().range([0, width]).padding(0.1).domain(components.map((d, i) => i));
        const yScale = this.d3.scaleLinear().range([height, 0]).domain(this.d3.extent(components));

        svg.selectAll('.bar')
            .data(components)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => xScale(i))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(Math.max(0, d)))
            .attr('height', d => Math.abs(yScale(d) - yScale(0)))
            .attr('fill', d => d >= 0 ? '#4ecdc4' : '#f06292');
    }

    renderStatsList(container, stats) {
        if (!container) return;
        let html = '';
        for (const [key, value] of Object.entries(stats)) {
            html += `
                <div class="stat-item-detailed">
                    <div class="stat-label-detailed">${key}</div>
                    <div class="stat-value-detailed">${value.toFixed(4)}</div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    calculateSimilarities(vector) {
        const forceCalculator = this.framework.getModules().forceCalculator;
        return this.framework.getState().vectors
            .filter(other => other.id !== vector.id)
            .map(other => ({
                index: other.id,
                similarity: forceCalculator.cosineSimilarity(vector, other),
                resonance: forceCalculator.resonanceForce(vector, other),
                correlation: forceCalculator.correlation(vector, other),
                distance: forceCalculator.euclideanDistance(vector, other)
            }));
    }
    
    updateControls() {
        const config = this.framework.getConfig();
        
        const dimensionsSlider = document.getElementById('dimensions');
        const dimValue = document.getElementById('dim-value');
        if (dimensionsSlider && dimValue) {
            dimensionsSlider.value = config.dimensions;
            dimValue.textContent = `${config.dimensions}D`;
        }

        const vectorsSlider = document.getElementById('vectors');
        const vecValue = document.getElementById('vec-value');
        if (vectorsSlider && vecValue) {
            vectorsSlider.value = config.numVectors;
            vecValue.textContent = config.numVectors;
        }
    }

    showAddVectorModal() {
        // Remove existing modal if present
        let modal = document.getElementById('add-vector-modal');
        if (modal) modal.remove();

        const dims = this.framework.getConfig().dimensions;
        modal = document.createElement('div');
        modal.id = 'add-vector-modal';
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Add Custom Vector');
        modal.innerHTML = `
            <div class="modal-content" tabindex="-1">
                <button class="close-button" aria-label="Close">&times;</button>
                <h2>Add Custom Vector</h2>
                <form id="add-vector-form">
                    <div class="vector-input-fields">
                        ${Array.from({length: dims}).map((_, i) => `
                            <label>Component ${i+1}: <input type="number" step="any" name="component${i}" required aria-label="Component ${i+1}"></label>
                        `).join('')}
                    </div>
                    <button type="submit" class="btn-compact btn-primary">Add Vector</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus trap
        const focusable = modal.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
                else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
            }
        });
        setTimeout(() => first.focus(), 50);

        modal.querySelector('.close-button').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escHandler); }
        });

        const form = modal.querySelector('#add-vector-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const components = Array.from(form.elements)
                .filter(el => el.tagName === 'INPUT')
                .map(el => parseFloat(el.value));
            if (components.some(isNaN)) {
                alert('Please enter valid numbers for all components.');
                return;
            }
            this.framework.stateManager.addCustomVector(components);
            modal.remove();
        };
    }

    showToast(message, type = 'info') {
        // Remove existing toast if present
        let toast = document.getElementById('vectoverse-toast');
        if (toast) toast.remove();
        toast = document.createElement('div');
        toast.id = 'vectoverse-toast';
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.classList.add('visible'); }, 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    showProgress(message, percentage) {
        // Remove existing progress indicator if any
        const existing = document.querySelector('.upload-progress');
        if (existing) {
            existing.remove();
        }

        // Create progress indicator
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress';
        
        progressContainer.innerHTML = `
            <div class="progress-content">
                <div class="progress-message">${message}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-percentage">${percentage}%</div>
            </div>
        `;

        document.body.appendChild(progressContainer);
        
        // Trigger animation
        setTimeout(() => {
            progressContainer.classList.add('active');
        }, 10);
    }

    hideProgress() {
        const progressContainer = document.querySelector('.upload-progress');
        if (progressContainer) {
            progressContainer.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(progressContainer)) {
                    progressContainer.remove();
                }
            }, 300);
        }
    }
}
