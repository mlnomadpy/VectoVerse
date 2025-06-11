// Enhanced Tab Management System for VectoVerse
export class TabManager {
    constructor(framework) {
        this.framework = framework;
        this.tabs = new Map();
        this.activeTab = null;
        this.init();
    }    init() {
        // Check if DOM is ready before initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeWhenReady());
        } else {
            this.initializeWhenReady();
        }
    }

    initializeWhenReady() {
        // Wait for the main container to be available
        this.waitForElement('.container', () => {
            this.createTabStyles();
            this.createTabContainer();
            this.setupDefaultTabs();
        });
    }

    waitForElement(selector, callback, maxAttempts = 20) {
        let attempts = 0;
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                callback(element);
                return;
            }
            
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn(`TabManager: Could not find element ${selector} after ${maxAttempts} attempts`);
                return;
            }
            
            setTimeout(checkElement, 100);
        };
        
        checkElement();
    }

    createTabStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tab-container {
                position: relative;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                padding: 0;
                margin: 16px 0;
                border: 1px solid rgba(255,255,255,0.2);
                overflow: hidden;
            }

            .tab-header {
                display: flex;
                background: rgba(0,0,0,0.1);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                position: relative;
            }

            .tab-button {
                flex: 1;
                padding: 16px 24px;
                border: none;
                background: transparent;
                color: rgba(255,255,255,0.7);
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                position: relative;
                min-width: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 14px;
                outline: none;
            }

            .tab-button:hover {
                background: rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.9);
            }

            .tab-button.active {
                color: white;
                background: rgba(255,255,255,0.15);
            }

            .tab-button::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }

            .tab-button.active::after {
                transform: scaleX(1);
            }

            .tab-content {
                padding: 24px;
                min-height: 300px;
                position: relative;
            }

            .tab-panel {
                display: none;
                animation: fadeIn 0.3s ease;
            }

            .tab-panel.active {
                display: block;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .tab-icon {
                width: 18px;
                height: 18px;
                fill: currentColor;
            }

            .tab-close {
                margin-left: 8px;
                padding: 2px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                cursor: pointer;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tab-button:hover .tab-close {
                opacity: 1;
            }

            .tab-close:hover {
                background: rgba(255,0,0,0.3);
            }

            .add-tab-button {
                padding: 16px;
                border: none;
                background: transparent;
                color: rgba(255,255,255,0.5);
                cursor: pointer;
                transition: all 0.3s ease;
                border-left: 1px solid rgba(255,255,255,0.1);
            }

            .add-tab-button:hover {
                background: rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.8);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .tab-header {
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .tab-header::-webkit-scrollbar {
                    display: none;
                }

                .tab-button {
                    min-width: 100px;
                    font-size: 12px;
                    padding: 12px 16px;
                }
            }

            /* High contrast support */
            @media (prefers-contrast: high) {
                .tab-container {
                    border: 2px solid white;
                    background: black;
                }

                .tab-button {
                    border: 1px solid white;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .tab-button,
                .tab-panel,
                .tab-button::after {
                    transition: none !important;
                    animation: none !important;
                }
            }

            .viz-3d-layout {
                display: flex;
                height: 100%;
            }
            .viz-3d-controls {
                width: 300px;
                padding-right: 20px;
                border-right: 1px solid #ccc;
            }
            .viz-3d-container {
                flex-grow: 1;
            }
        `;

        const existingStyle = document.querySelector('#tab-manager-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        style.id = 'tab-manager-styles';
        document.head.appendChild(style);
    }    createTabContainer() {
        // Look for existing controls container or create one
        let controlsContainer = document.querySelector('.controls');
        
        if (!controlsContainer) {
            // If .controls doesn't exist, look for .controls-topbar and insert after it
            const topbar = document.querySelector('.controls-topbar');
            if (topbar) {
                controlsContainer = document.createElement('div');
                controlsContainer.className = 'controls';
                topbar.parentNode.insertBefore(controlsContainer, topbar.nextSibling);
            } else {
                // Fallback: insert into container
                const container = document.querySelector('.container');
                if (container) {
                    controlsContainer = document.createElement('div');
                    controlsContainer.className = 'controls';
                    const visualization = container.querySelector('.visualization');
                    if (visualization) {
                        container.insertBefore(controlsContainer, visualization);
                    } else {
                        container.appendChild(controlsContainer);
                    }
                } else {
                    console.error('Could not find suitable container for tabs');
                    return;
                }
            }
        }
        
        this.tabContainer = document.createElement('div');
        this.tabContainer.className = 'tab-container';
        this.tabContainer.setAttribute('role', 'tablist');

        this.tabHeader = document.createElement('div');
        this.tabHeader.className = 'tab-header';

        this.tabContent = document.createElement('div');
        this.tabContent.className = 'tab-content';

        // Add tab button
        this.addTabButton = document.createElement('button');
        this.addTabButton.className = 'add-tab-button';
        this.addTabButton.innerHTML = this.createIcon('plus').outerHTML;
        this.addTabButton.setAttribute('title', 'Add new tab');
        this.addTabButton.addEventListener('click', () => this.showAddTabDialog());

        this.tabHeader.appendChild(this.addTabButton);
        this.tabContainer.appendChild(this.tabHeader);
        this.tabContainer.appendChild(this.tabContent);

        controlsContainer.appendChild(this.tabContainer);
    }    setupDefaultTabs() {
        // Create default tabs - start with essential ones
        this.addTab('vectors', 'Vectors', this.createVectorsPanel(), 'target');
        this.addTab('analysis', 'Analysis', this.createAnalysisPanel(), 'trending-up');
        this.addTab('visualization', 'Visualization', this.createVisualizationPanel(), 'eye');
        this.addTab('settings', 'Settings', this.createSettingsPanel(), 'settings');
        
        // Add 3D tab with proper initialization check
        try {
            this.addTab('3d-viz', '3D View', this.create3DVisualizationPanel(), 'box');
        } catch (error) {
            console.warn('3D visualization tab could not be initialized:', error);
        }

        // Set vectors tab as active
        this.setActiveTab('vectors');
    }

    addTab(id, title, content, icon = null, closeable = true) {
        // Create tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.setAttribute('role', 'tab');
        tabButton.setAttribute('aria-controls', `panel-${id}`);
        tabButton.setAttribute('aria-selected', 'false');
        tabButton.setAttribute('tabindex', '-1');        if (icon) {
            const iconEl = this.createIcon(icon);
            iconEl.setAttribute('class', 'tab-icon');
            tabButton.appendChild(iconEl);
        }

        const titleEl = document.createElement('span');
        titleEl.textContent = title;
        tabButton.appendChild(titleEl);

        if (closeable) {
            const closeBtn = document.createElement('span');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = this.createIcon('x').outerHTML;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTab(id);
            });
            tabButton.appendChild(closeBtn);
        }

        // Create tab panel
        const tabPanel = document.createElement('div');
        tabPanel.className = 'tab-panel';
        tabPanel.id = `panel-${id}`;
        tabPanel.setAttribute('role', 'tabpanel');
        tabPanel.setAttribute('aria-labelledby', `tab-${id}`);
        tabPanel.appendChild(content);

        // Add event listeners
        tabButton.addEventListener('click', () => this.setActiveTab(id));
        tabButton.addEventListener('keydown', (e) => this.handleTabKeydown(e, id));

        // Insert before add button
        this.tabHeader.insertBefore(tabButton, this.addTabButton);
        this.tabContent.appendChild(tabPanel);        // Store tab data
        this.tabs.set(id, {
            button: tabButton,
            panel: tabPanel,
            title: title,
            closeable: closeable
        });        // Setup special event handlers for specific tabs after DOM insertion
        if (id === '3d-viz') {
            this.waitForElement(`#panel-${id}`, (tabPanel) => {
                this.setup3DEventHandlers(tabPanel);
            }, 50); // Increased maxAttempts for robustness
        }

        return id;
    }

    removeTab(id) {
        const tab = this.tabs.get(id);
        if (!tab || !tab.closeable) return;

        // If removing active tab, switch to another
        if (this.activeTab === id) {
            const tabIds = Array.from(this.tabs.keys());
            const currentIndex = tabIds.indexOf(id);
            const nextTab = tabIds[currentIndex + 1] || tabIds[currentIndex - 1];
            if (nextTab) {
                this.setActiveTab(nextTab);
            }
        }

        // Remove elements
        tab.button.remove();
        tab.panel.remove();
        this.tabs.delete(id);
    }

    setActiveTab(id) {
        const tab = this.tabs.get(id);
        if (!tab) return;

        // Deactivate all tabs
        this.tabs.forEach((tabData, tabId) => {
            tabData.button.classList.remove('active');
            tabData.button.setAttribute('aria-selected', 'false');
            tabData.button.setAttribute('tabindex', '-1');
            tabData.panel.classList.remove('active');
        });

        // Activate selected tab
        tab.button.classList.add('active');
        tab.button.setAttribute('aria-selected', 'true');
        tab.button.setAttribute('tabindex', '0');
        tab.panel.classList.add('active');

        this.activeTab = id;

        // Notify framework
        this.framework.notify('tabChanged', { activeTab: id });
    }

    handleTabKeydown(event, id) {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(id);

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                const prevTab = tabIds[currentIndex - 1] || tabIds[tabIds.length - 1];
                this.setActiveTab(prevTab);
                break;
            case 'ArrowRight':
                event.preventDefault();
                const nextTab = tabIds[currentIndex + 1] || tabIds[0];
                this.setActiveTab(nextTab);
                break;
            case 'Home':
                event.preventDefault();
                this.setActiveTab(tabIds[0]);
                break;
            case 'End':
                event.preventDefault();
                this.setActiveTab(tabIds[tabIds.length - 1]);
                break;
        }
    }

    showAddTabDialog() {
        // Simple prompt for now, can be enhanced with a proper modal
        const name = prompt('Enter tab name:');
        if (name) {
            const id = `custom-${Date.now()}`;
            const content = document.createElement('div');
            content.innerHTML = `
                <h3>Custom Tab: ${name}</h3>
                <p>This is a custom tab. You can add your own content here.</p>
            `;
            this.addTab(id, name, content, 'file-text');
            this.setActiveTab(id);
        }
    }

    createVectorsPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <h3>Vector Operations</h3>
            <div class="vector-controls">
                <div class="control-group">
                    <label>Vector Count:</label>
                    <input type="range" id="vector-count" min="1" max="50" value="10">
                    <span id="vector-count-display">10</span>
                </div>
                <div class="control-group">
                    <label>Dimension:</label>
                    <select id="vector-dimension">
                        <option value="2">2D</option>
                        <option value="3">3D</option>
                        <option value="4">4D</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Distribution:</label>
                    <select id="vector-distribution">
                        <option value="random">Random</option>
                        <option value="normal">Normal</option>
                        <option value="uniform">Uniform</option>
                    </select>
                </div>
            </div>
        `;

        // Add event listeners
        const countSlider = panel.querySelector('#vector-count');
        const countDisplay = panel.querySelector('#vector-count-display');
        
        countSlider.addEventListener('input', (e) => {
            countDisplay.textContent = e.target.value;
            this.framework.notify('vectorCountChanged', { count: parseInt(e.target.value) });
        });

        return panel;
    }    createAnalysisPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <h3>Vector Analysis</h3>
            <div class="analysis-tools">
                <div class="analysis-section">
                    <h4>Similarity Analysis</h4>
                    <button class="btn-modern btn-primary" id="cosine-similarity">Cosine Similarity</button>
                    <button class="btn-modern btn-secondary" id="euclidean-distance">Euclidean Distance</button>
                </div>
                <div class="analysis-section">
                    <h4>Dimensionality Reduction</h4>
                    <button class="btn-modern btn-success" id="pca-analysis">PCA Analysis</button>
                    <button class="btn-modern btn-info" id="tsne-analysis">t-SNE Analysis</button>
                </div>
                <div class="analysis-section">
                    <h4>Clustering</h4>
                    <button class="btn-modern btn-warning" id="kmeans-cluster">K-Means Clustering</button>
                    <button class="btn-modern btn-danger" id="hierarchical-cluster">Hierarchical Clustering</button>
                    <button class="btn-modern btn-primary" id="dbscan-cluster">DBSCAN Clustering</button>
                </div>
                <div class="analysis-section">
                    <h4>Analysis Parameters</h4>
                    <div class="control-group">
                        <label>PCA Components:</label>
                        <input type="number" id="pca-components" min="2" max="10" value="2">
                    </div>
                    <div class="control-group">
                        <label>t-SNE Perplexity:</label>
                        <input type="number" id="tsne-perplexity" min="5" max="50" value="30">
                    </div>
                    <div class="control-group">
                        <label>K-Means Clusters:</label>
                        <input type="number" id="kmeans-k" min="2" max="10" value="3">
                    </div>
                </div>
            </div>
            <div class="analysis-results" id="analysis-results">
                <h4>Analysis Results</h4>
                <div id="analysis-output">Select an analysis method to see results here.</div>
            </div>
        `;

        // Add event listeners for analysis buttons
        this.setupAnalysisEventListeners(panel);

        return panel;
    }

    setupAnalysisEventListeners(panel) {
        // PCA Analysis
        panel.querySelector('#pca-analysis').addEventListener('click', async () => {
            const components = parseInt(panel.querySelector('#pca-components').value);
            await this.runPCAAnalysis(components);
        });

        // t-SNE Analysis
        panel.querySelector('#tsne-analysis').addEventListener('click', async () => {
            const perplexity = parseInt(panel.querySelector('#tsne-perplexity').value);
            await this.runTSNEAnalysis(perplexity);
        });

        // K-Means Clustering
        panel.querySelector('#kmeans-cluster').addEventListener('click', async () => {
            const k = parseInt(panel.querySelector('#kmeans-k').value);
            await this.runKMeansAnalysis(k);
        });

        // Hierarchical Clustering
        panel.querySelector('#hierarchical-cluster').addEventListener('click', async () => {
            await this.runHierarchicalAnalysis();
        });

        // DBSCAN Clustering
        panel.querySelector('#dbscan-cluster').addEventListener('click', async () => {
            await this.runDBSCANAnalysis();
        });

        // Cosine Similarity
        panel.querySelector('#cosine-similarity').addEventListener('click', () => {
            this.runSimilarityAnalysis('cosine');
        });

        // Euclidean Distance
        panel.querySelector('#euclidean-distance').addEventListener('click', () => {
            this.runSimilarityAnalysis('euclidean');
        });
    }

    async runPCAAnalysis(components) {
        try {
            this.showAnalysisProgress('Running PCA Analysis...');
            const vectors = this.framework.getState().vectors;
            const result = await this.framework.modules.analysisEngine.performPCA(vectors, components);
            this.displayAnalysisResult('PCA', result);
        } catch (error) {
            this.showAnalysisError('PCA Analysis failed: ' + error.message);
        }
    }

    async runTSNEAnalysis(perplexity) {
        try {
            this.showAnalysisProgress('Running t-SNE Analysis... (this may take a while)');
            const vectors = this.framework.getState().vectors;
            const result = await this.framework.modules.analysisEngine.performTSNE(vectors, { perplexity });
            this.displayAnalysisResult('t-SNE', result);
        } catch (error) {
            this.showAnalysisError('t-SNE Analysis failed: ' + error.message);
        }
    }

    async runKMeansAnalysis(k) {
        try {
            this.showAnalysisProgress('Running K-Means Clustering...');
            const vectors = this.framework.getState().vectors;
            const result = await this.framework.modules.analysisEngine.performKMeans(vectors, k);
            this.displayAnalysisResult('K-Means', result);
        } catch (error) {
            this.showAnalysisError('K-Means Analysis failed: ' + error.message);
        }
    }

    async runHierarchicalAnalysis() {
        try {
            this.showAnalysisProgress('Running Hierarchical Clustering...');
            const vectors = this.framework.getState().vectors;
            const result = await this.framework.modules.analysisEngine.performHierarchicalClustering(vectors);
            this.displayAnalysisResult('Hierarchical', result);
        } catch (error) {
            this.showAnalysisError('Hierarchical Analysis failed: ' + error.message);
        }
    }

    async runDBSCANAnalysis() {
        try {
            this.showAnalysisProgress('Running DBSCAN Clustering...');
            const vectors = this.framework.getState().vectors;
            const result = await this.framework.modules.analysisEngine.performDBSCAN(vectors);
            this.displayAnalysisResult('DBSCAN', result);
        } catch (error) {
            this.showAnalysisError('DBSCAN Analysis failed: ' + error.message);
        }
    }

    runSimilarityAnalysis(method) {
        try {
            const vectors = this.framework.getState().vectors;
            const selectedVector = this.framework.getState().selectedVector;
            
            if (!selectedVector) {
                this.showAnalysisError('Please select a vector first to run similarity analysis');
                return;
            }

            const similarities = vectors
                .filter(v => v.id !== selectedVector.id)
                .map(v => {
                    const similarity = method === 'cosine' 
                        ? this.framework.modules.forceCalculator.cosineSimilarity(selectedVector, v)
                        : -this.framework.modules.forceCalculator.euclideanDistance(selectedVector.components, v.components);
                    
                    return {
                        vector: v,
                        similarity: similarity,
                        distance: this.framework.modules.forceCalculator.euclideanDistance(selectedVector.components, v.components)
                    };
                })
                .sort((a, b) => b.similarity - a.similarity);

            this.displaySimilarityResult(method, selectedVector, similarities);
        } catch (error) {
            this.showAnalysisError('Similarity Analysis failed: ' + error.message);
        }
    }

    showAnalysisProgress(message) {
        const output = document.querySelector('#analysis-output');
        if (output) {
            output.innerHTML = `<div class="analysis-progress">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>`;
        }
    }

    showAnalysisError(message) {
        const output = document.querySelector('#analysis-output');
        if (output) {
            output.innerHTML = `<div class="analysis-error">
                <h5>❌ Error</h5>
                <p>${message}</p>
            </div>`;
        }
    }

    displayAnalysisResult(method, result) {
        const output = document.querySelector('#analysis-output');
        if (!output) return;

        let html = `<div class="analysis-result">
            <h5>✅ ${method} Analysis Complete</h5>
            <div class="result-metadata">
                <p><strong>Method:</strong> ${result.method}</p>
                <p><strong>Vectors Analyzed:</strong> ${result.originalVectors?.length || 'N/A'}</p>
                <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
            </div>`;

        if (method === 'PCA') {
            html += `<div class="pca-results">
                <h6>Principal Component Analysis</h6>
                <p><strong>Components:</strong> ${result.principalComponents.length}</p>
                <p><strong>Explained Variance:</strong></p>
                <ul>`;
            result.explainedVariance.forEach((variance, i) => {
                html += `<li>PC${i + 1}: ${(variance * 100).toFixed(2)}%</li>`;
            });
            html += `</ul>
                <p><strong>Cumulative Variance:</strong> ${(result.explainedVariance.reduce((sum, v) => sum + v, 0) * 100).toFixed(2)}%</p>
            </div>`;
        } else if (method === 'K-Means') {
            html += `<div class="kmeans-results">
                <h6>K-Means Clustering</h6>
                <p><strong>Clusters:</strong> ${result.k}</p>
                <p><strong>Iterations:</strong> ${result.iterations}</p>
                <p><strong>Converged:</strong> ${result.converged ? 'Yes' : 'No'}</p>
                <p><strong>Silhouette Score:</strong> ${result.silhouetteScore.toFixed(4)}</p>
                <p><strong>Inertia:</strong> ${result.inertia.toFixed(4)}</p>
                <div class="cluster-breakdown">`;
            result.clusters.forEach((cluster, i) => {
                html += `<p>Cluster ${i}: ${cluster.size} vectors</p>`;
            });
            html += `</div></div>`;
        } else if (method === 't-SNE') {
            html += `<div class="tsne-results">
                <h6>t-SNE Dimensionality Reduction</h6>
                <p><strong>Target Dimensions:</strong> ${result.parameters?.dimensions || 2}</p>
                <p><strong>Perplexity:</strong> ${result.parameters?.perplexity || 30}</p>
                <p><strong>Projected Points:</strong> ${result.projectedVectors.length}</p>
            </div>`;
        }

        html += `</div>`;
        output.innerHTML = html;

        // Trigger math rendering
        if (typeof window.renderMath === 'function') {
            setTimeout(() => window.renderMath(output), 100);
        }
    }

    displaySimilarityResult(method, selectedVector, similarities) {
        const output = document.querySelector('#analysis-output');
        if (!output) return;

        let html = `<div class="similarity-result">
            <h5>🔍 ${method === 'cosine' ? 'Cosine' : 'Euclidean'} Similarity Analysis</h5>
            <p><strong>Reference Vector:</strong> Vector ${selectedVector.id}</p>
            <div class="similarity-list">`;

        similarities.slice(0, 5).forEach((item, i) => {
            const percentage = method === 'cosine' 
                ? ((item.similarity + 1) / 2 * 100).toFixed(1)
                : (100 / (1 + item.distance)).toFixed(1);
            
            html += `<div class="similarity-item">
                <span class="vector-id">Vector ${item.vector.id}</span>
                <span class="similarity-value">${method === 'cosine' ? item.similarity.toFixed(4) : item.distance.toFixed(4)}</span>
                <span class="similarity-percentage">(${percentage}%)</span>
            </div>`;
        });

        html += `</div></div>`;
        output.innerHTML = html;
    }

    createVisualizationPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <h3>Visualization Options</h3>
            <div class="viz-controls">
                <div class="viz-section">
                    <h4>Display Mode</h4>
                    <label><input type="radio" name="display-mode" value="2d" checked> 2D View</label>
                    <label><input type="radio" name="display-mode" value="3d"> 3D View</label>
                    <label><input type="radio" name="display-mode" value="network"> Network View</label>
                </div>
                <div class="viz-section">
                    <h4>Color Scheme</h4>
                    <select id="color-scheme">
                        <option value="default">Default</option>
                        <option value="viridis">Viridis</option>
                        <option value="plasma">Plasma</option>
                        <option value="rainbow">Rainbow</option>
                    </select>
                </div>
                <div class="viz-section">
                    <h4>Animation</h4>
                    <label><input type="checkbox" id="enable-animation"> Enable Animation</label>
                    <label>Speed: <input type="range" id="animation-speed" min="1" max="10" value="5"></label>
                </div>
            </div>
        `;

        return panel;
    }

    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <h3>Application Settings</h3>
            <div class="settings-grid">
                <div class="setting-group">
                    <h4>Appearance</h4>
                    <label><input type="checkbox" id="dark-theme" checked> Dark Theme</label>
                    <label><input type="checkbox" id="high-contrast"> High Contrast</label>
                    <label><input type="checkbox" id="reduced-motion"> Reduced Motion</label>
                </div>
                <div class="setting-group">
                    <h4>Performance</h4>
                    <label><input type="checkbox" id="gpu-acceleration" checked> GPU Acceleration</label>
                    <label><input type="checkbox" id="frame-limiting"> Limit Frame Rate</label>
                    <label>Quality: <input type="range" id="render-quality" min="1" max="5" value="3"></label>
                </div>
                <div class="setting-group">
                    <h4>Accessibility</h4>
                    <label><input type="checkbox" id="screen-reader"> Screen Reader Support</label>
                    <label><input type="checkbox" id="keyboard-nav" checked> Keyboard Navigation</label>
                    <label><input type="checkbox" id="audio-feedback"> Audio Feedback</label>
                </div>
            </div>
        `;

        return panel;
    }

    create3DVisualizationPanel() {
        const panel = document.createElement('div');
        panel.className = 'viz-3d-section';
        
        panel.innerHTML = `
            <div class="viz-3d-layout">
                <div class="viz-3d-controls">
                    <h3>🎮 3D Visualization Controls</h3>
                    
                    <div class="control-group">
                        <label>3D Render Mode:</label>
                        <select id="v3d-render-mode">
                            <option value="points">Point Cloud</option>
                            <option value="spheres">Spheres</option>
                            <option value="wireframe">Wireframe</option>
                            <option value="mesh">Solid Mesh</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Point Size:</label>
                        <input type="range" id="v3d-point-size" min="0.01" max="0.2" step="0.01" value="0.05">
                        <span id="v3d-point-size-value">0.05</span>
                    </div>
                    
                    <div class="control-group">
                        <label>Background Color:</label>
                        <input type="color" id="v3d-background-color" value="#1a1a1a">
                    </div>
                    
                    <div class="control-group">
                        <div class="checkbox-container">
                            <input type="checkbox" id="v3d-show-axes" checked>
                            <label for="v3d-show-axes">Show Axes</label>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <div class="checkbox-container">
                            <input type="checkbox" id="v3d-show-grid" checked>
                            <label for="v3d-show-grid">Show Grid</label>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <div class="checkbox-container">
                            <input type="checkbox" id="v3d-auto-rotate">
                            <label for="v3d-auto-rotate">Auto Rotate</label>
                        </div>
                    </div>
                    
                    <div class="viz-3d-buttons">
                        <button id="v3d-initialize" class="btn-modern primary">
                            🚀 Initialize 3D View
                        </button>
                        <button id="v3d-reset-camera" class="btn-modern secondary">
                            📷 Reset Camera
                        </button>
                        <button id="v3d-toggle-fullscreen" class="btn-modern secondary">
                            🔳 Toggle Fullscreen
                        </button>
                        <button id="v3d-export-scene" class="btn-modern secondary">
                            💾 Export Scene
                        </button>
                    </div>
                    
                    <div class="viz-3d-info">
                        <h4>💡 3D Navigation</h4>
                        <ul>
                            <li><strong>Mouse Drag:</strong> Rotate camera</li>
                            <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
                            <li><strong>Click Vector:</strong> Select and highlight</li>
                            <li><strong>Hover:</strong> Show vector details</li>
                        </ul>
                    </div>
                </div>
                
                <div class="viz-3d-container">
                    <div id="threejs-container" class="threejs-viewport">
                        <div class="threejs-placeholder">
                            <div class="placeholder-content">
                                <div class="placeholder-icon">🎮</div>
                                <h3>3D Vector Visualization</h3>
                                <p>Click "Initialize 3D View" to start exploring vectors in three-dimensional space</p>
                                <div class="placeholder-features">
                                    <div class="feature-item">
                                        <span class="feature-icon">🌐</span>
                                        <span>Interactive 3D Navigation</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">🎯</span>
                                        <span>Real-time Vector Tracking</span>
                                    </div>
                                    <div class="feature-item">
                                        <span class="feature-icon">🔬</span>
                                        <span>Analysis Visualization</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return panel;
    }    setup3DEventHandlers(panel) {
        // Wait for elements to be available in DOM
        if (!panel || !panel.querySelector) {
            console.warn('Panel not ready for 3D event handlers');
            return;
        }
        
        // Debug: Log the panel structure
        console.log('Setting up 3D event handlers, panel:', panel);
        console.log('Panel innerHTML preview:', panel.innerHTML.substring(0, 200));
        
        // Verify the panel contains the expected 3D controls
        const controlsContainer = panel.querySelector('.viz-3d-controls');
        if (!controlsContainer) {
            console.warn('3D controls container not found in panel');
            // Try to find any div with an id that starts with "v3d-"
            const anyControl = panel.querySelector('[id^="v3d-"]');
            console.log('Any 3D control found:', anyControl);
            return;
        }
        
        // Initialize 3D button
        const initButton = panel.querySelector('#v3d-initialize');
        if (initButton) {
            initButton.addEventListener('click', () => {
                const container = panel.querySelector('#threejs-container');
                if (container) {
                    // Clear placeholder
                    container.innerHTML = '';
                    
                    // Initialize 3D visualization
                    try {
                        if (this.framework && typeof this.framework.initialize3DVisualization === 'function') {
                            const viz3D = this.framework.initialize3DVisualization(container);
                            if (viz3D) {
                                this.show3DNotification('3D visualization initialized successfully!', 'success');
                                initButton.textContent = '✅ 3D View Active';
                                initButton.disabled = true;
                            }
                        } else {
                            throw new Error('3D visualization not available');
                        }
                    } catch (error) {
                        console.error('Failed to initialize 3D visualization:', error);
                        this.show3DNotification('Failed to initialize 3D view: ' + error.message, 'error');
                    }
                }
            });
        } else {
            console.warn('Initialize 3D button not found');
        }
        
        // 3D Settings handlers with better error handling
        try {
            // Debug: Check if elements exist before querying
            console.log('Looking for point size slider...');
            const pointSizeSlider = panel.querySelector('#v3d-point-size');
            const pointSizeValue = panel.querySelector('#v3d-point-size-value');
            console.log('Point size slider found:', !!pointSizeSlider);
            console.log('Point size value found:', !!pointSizeValue);
            
            if (pointSizeSlider && pointSizeValue) {
                pointSizeSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    pointSizeValue.textContent = value.toFixed(3);
                    if (this.framework && typeof this.framework.update3DSettings === 'function') {
                        this.framework.update3DSettings({ pointSize: value });
                    }
                });
            } else {
                console.warn('Point size slider or value display not found');
            }
        } catch (error) {
            console.error('Error setting up point size slider:', error);
        }        try {
            const backgroundColorPicker = panel.querySelector('#v3d-background-color');
            if (backgroundColorPicker) {
                backgroundColorPicker.addEventListener('change', (e) => {
                    const color = parseInt(e.target.value.replace('#', ''), 16);
                    if (this.framework && typeof this.framework.update3DSettings === 'function') {
                        this.framework.update3DSettings({ backgroundColor: color });
                    }
                });
            } else {
                console.warn('Background color picker not found');
            }
        } catch (error) {
            console.error('Error setting up background color picker:', error);
        }
        
        try {
            const showAxesCheckbox = panel.querySelector('#v3d-show-axes');
            if (showAxesCheckbox) {
                showAxesCheckbox.addEventListener('change', (e) => {
                    if (this.framework && typeof this.framework.update3DSettings === 'function') {
                        this.framework.update3DSettings({ showAxes: e.target.checked });
                    }
                });
            } else {
                console.warn('Show axes checkbox not found');
            }
        } catch (error) {
            console.error('Error setting up show axes checkbox:', error);
        }
        
        try {
            const showGridCheckbox = panel.querySelector('#v3d-show-grid');
            if (showGridCheckbox) {
                showGridCheckbox.addEventListener('change', (e) => {
                    if (this.framework && typeof this.framework.update3DSettings === 'function') {
                        this.framework.update3DSettings({ showGrid: e.target.checked });
                    }
                });
            } else {
                console.warn('Show grid checkbox not found');
            }
        } catch (error) {
            console.error('Error setting up show grid checkbox:', error);
        }
        
        try {
            const autoRotateCheckbox = panel.querySelector('#v3d-auto-rotate');
            if (autoRotateCheckbox) {
                autoRotateCheckbox.addEventListener('change', (e) => {
                    if (this.framework && typeof this.framework.update3DSettings === 'function') {
                        this.framework.update3DSettings({ autoRotate: e.target.checked });
                    }
                });
            } else {
                console.warn('Auto rotate checkbox not found');
            }
        } catch (error) {
            console.error('Error setting up auto rotate checkbox:', error);
        }// Reset camera button
        try {
            const resetCameraButton = panel.querySelector('#v3d-reset-camera');
            if (resetCameraButton) {
                resetCameraButton.addEventListener('click', () => {
                    if (this.framework && this.framework.modules && this.framework.modules.threeJSVisualization) {
                        this.framework.modules.threeJSVisualization.camera.position.set(5, 5, 5);
                        this.framework.modules.threeJSVisualization.camera.lookAt(0, 0, 0);
                        this.show3DNotification('Camera reset to default position', 'info');
                    } else {
                        this.show3DNotification('3D visualization not initialized', 'error');
                    }
                });
            } else {
                console.warn('Reset camera button not found');
            }
        } catch (error) {
            console.error('Error setting up reset camera button:', error);
        }
        
        // Export 3D scene button
        try {
            const exportSceneButton = panel.querySelector('#v3d-export-scene');
            if (exportSceneButton) {
                exportSceneButton.addEventListener('click', () => {
                    if (this.framework && typeof this.framework.export3DScene === 'function') {
                        const sceneData = this.framework.export3DScene();
                        if (sceneData) {
                            const dataStr = JSON.stringify(sceneData, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `vectoverse-3d-scene-${new Date().toISOString().slice(0, 10)}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                            this.show3DNotification('3D scene exported successfully!', 'success');
                        } else {
                            this.show3DNotification('No 3D scene to export', 'warning');
                        }
                    } else {
                        this.show3DNotification('Export functionality not available', 'error');
                    }
                });
            } else {
                console.warn('Export scene button not found');
            }
        } catch (error) {
            console.error('Error setting up export scene button:', error);
        }
        
        // Render mode selector
        try {
            const renderModeSelect = panel.querySelector('#v3d-render-mode');
            if (renderModeSelect) {
                renderModeSelect.addEventListener('change', (e) => {
                    // This would be implemented to change the rendering style
                    this.show3DNotification(`Render mode changed to ${e.target.value}`, 'info');
                });
            } else {
                console.warn('Render mode selector not found');
            }
        } catch (error) {
            console.error('Error setting up render mode selector:', error);
        }
    }
    
    show3DNotification(message, type = 'info') {
        // Create a simple notification for 3D operations
        const notification = document.createElement('div');
        notification.className = `notification-3d ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Public API methods
    getActiveTab() {
        return this.activeTab;
    }

    getAllTabs() {
        return Array.from(this.tabs.keys());
    }

    getTabTitle(id) {
        const tab = this.tabs.get(id);
        return tab ? tab.title : null;
    }

    updateTabTitle(id, newTitle) {
        const tab = this.tabs.get(id);
        if (tab) {
            tab.title = newTitle;
            const titleEl = tab.button.querySelector('span');
            if (titleEl) {
                titleEl.textContent = newTitle;
            }
        }
    }

    destroy() {
        // Clean up all tabs and event listeners
        this.tabs.clear();
        if (this.tabContainer && this.tabContainer.parentNode) {
            this.tabContainer.parentNode.removeChild(this.tabContainer);
        }
    }

    createIcon(iconName) {
        // Create SVG icons for tab management
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('width', '18');
        iconSvg.setAttribute('height', '18');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('fill', 'none');
        iconSvg.setAttribute('stroke', 'currentColor');
        iconSvg.setAttribute('stroke-width', '2');
        iconSvg.setAttribute('stroke-linecap', 'round');
        iconSvg.setAttribute('stroke-linejoin', 'round');
        
        let pathData = '';
        
        switch (iconName) {
            case 'plus':
                pathData = 'M12 5v14M5 12h14';
                break;
            case 'x':
                pathData = 'M18 6L6 18M6 6l12 12';
                break;
            case 'target':
                pathData = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5';
                break;
            case 'trending-up':
                pathData = 'M23 6l-9.5 9.5-5-5L1 18';
                const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle1.setAttribute('cx', '23');
                circle1.setAttribute('cy', '6');
                circle1.setAttribute('r', '1');
                iconSvg.appendChild(circle1);
                break;
            case 'eye':
                pathData = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z';
                const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle2.setAttribute('cx', '12');
                circle2.setAttribute('cy', '12');
                circle2.setAttribute('r', '3');
                iconSvg.appendChild(circle2);
                break;
            case 'box':
                pathData = 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z';
                const additionalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                additionalPath.setAttribute('d', 'M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12');
                iconSvg.appendChild(additionalPath);
                break;
            case 'settings':
                pathData = 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z';
                const circle3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle3.setAttribute('cx', '12');
                circle3.setAttribute('cy', '12');
                circle3.setAttribute('r', '3');
                iconSvg.appendChild(circle3);
                break;
            case 'file-text':
                pathData = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z';
                const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                line1.setAttribute('d', 'M14 2v6h6');
                iconSvg.appendChild(line1);
                const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                line2.setAttribute('d', 'M16 13H8M16 17H8M10 9H8');
                iconSvg.appendChild(line2);
                break;
            default:
                // Default to a simple circle if icon not found
                pathData = 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z';
                break;
        }
        
        if (pathData) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            iconSvg.appendChild(path);
        }
        
        return iconSvg;
    }
}
