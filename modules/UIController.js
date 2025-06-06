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
        
        this.framework.eventBus.on('stateChanged', () => {
            this.updateVectorDetails();
            this.updateControls();
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
        
        document.getElementById('add-input-vector')?.addEventListener('click', () => this.framework.addInputVector());
        document.getElementById('export-json')?.addEventListener('click', () => this.framework.modules.fileHandler.exportJSON());
        
        const vectorFileInput = document.getElementById('vector-file');
        if (vectorFileInput) {
            vectorFileInput.addEventListener('change', (e) => this.framework.modules.fileHandler.handleFileUpload(e));
        }
    }

    setupThemeSwitcher() {
        const themeSwitcher = document.querySelector('.theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                themeSwitcher.textContent = isLight ? '🌑' : '🌙';
            });
        }
    }

    setupHelpModal() {
        const modal = document.getElementById('tutorial-modal');
        const showButton = document.getElementById('show-help');
        const closeButton = modal?.querySelector('.close-button');

        showButton?.addEventListener('click', () => modal?.classList.add('active'));
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

        showButton?.addEventListener('click', () => modal?.classList.add('active'));
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
    }

    async runAnalysis(type) {
        const resultsContainer = document.getElementById('analysis-results');
        const vectors = this.framework.getState().vectors;
        resultsContainer.innerHTML = `<p>Running ${type.toUpperCase()}... a feature that is coming soon!</p>`;
        
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
        } catch (error) {
            resultsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    displayAnalysisResults(result) {
        const resultsContainer = document.getElementById('analysis-results');
        let html = `<h4>${result.type.toUpperCase()} Results</h4>`;

        if (result.type === 'pca' || result.type === 'tsne') {
            html += '<p>Projected data (first 5 points):</p>';
            html += '<ul>';
            result.data.slice(0, 5).forEach(point => {
                html += `<li>[${point.map(p => p.toFixed(4)).join(', ')}]</li>`;
            });
            html += '</ul>';
        } else if (result.type === 'kmeans') {
            html += '<p>Cluster Assignments:</p>';
            result.data.clusters.forEach((cluster, i) => {
                html += `<h5>Cluster ${i + 1} (${cluster.points.length} points)</h5>`;
            });
        }

        resultsContainer.innerHTML = html;

        // Optionally, emit an event to update the main visualization
        this.framework.notify('analysisCompleted', result);
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
}
