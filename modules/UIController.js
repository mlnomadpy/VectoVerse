import { Constants } from './Constants.js';

export class UIController {
    constructor(framework) {
        this.framework = framework;
    }
    
    setupControls() {
        this.setupDimensionsControl();
        this.setupVectorsControl();
        this.setupButtons();
    }
    
    setupDimensionsControl() {
        d3.select("#dimensions").on("input", (event) => {
            const value = +event.target.value;
            d3.select("#dim-value").text(value);
            this.framework.updateConfig('dimensions', value);
        });
    }
    
    setupVectorsControl() {
        d3.select("#vectors").on("input", (event) => {
            const value = +event.target.value;
            d3.select("#vec-value").text(value);
            this.framework.updateConfig('numVectors', value);
        });
    }
    
    setupButtons() {
        d3.select("#regenerate").on("click", () => {
            this.framework.generateVectors();
            this.framework.render();
        });
        
        d3.select("#toggle-forces").on("click", () => {
            const config = this.framework.getConfig();
            config.showForces = !config.showForces;
            d3.select("#toggle-forces").text(
                config.showForces ? "Hide Resonance Forces" : "Show Resonance Forces"
            );
            this.framework.render();
        });
        
        d3.select("#vector-file").on("change", (event) => {
            this.framework.getModules().fileHandler.handleFileUpload(event.target.files[0]);
        });
        
        d3.select("#add-input-vector").on("click", () => {
            this.framework.addInputVector();
        });
    }
    
    showInputEditor() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        if (!state.inputVector) return;
        
        // Remove existing modal if any
        d3.select(".input-editor-modal").remove();
        
        // Create input editor modal
        const modal = d3.select("body").append("div")
            .attr("class", "input-editor-modal")
            .style("position", "fixed")
            .style("top", "0")
            .style("left", "0")
            .style("width", "100%")
            .style("height", "100%")
            .style("background", "rgba(0,0,0,0.8)")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("z-index", "1000");
        
        const content = modal.append("div")
            .attr("class", "input-editor-content")
            .style("background", "white")
            .style("padding", "20px")
            .style("border-radius", "10px")
            .style("color", "black")
            .style("max-width", "500px")
            .style("width", "90%");
        
        content.append("h3").text("🎛️ Edit Input Vector Components");
        
        const form = content.append("div").attr("class", "input-editor-form");
        
        state.inputVector.components.forEach((component, index) => {
            const row = form.append("div")
                .style("margin-bottom", "10px")
                .style("display", "flex")
                .style("align-items", "center")
                .style("gap", "10px");
            
            row.append("label")
                .style("min-width", "30px")
                .text(`D${index + 1}:`);
            
            row.append("input")
                .attr("type", "range")
                .attr("min", "-2")
                .attr("max", "2")
                .attr("step", "0.01")
                .attr("value", component)
                .attr("id", `input-dim-${index}`)
                .style("flex", "1")
                .on("input", (event) => {
                    state.inputVector.components[index] = parseFloat(event.target.value);
                    d3.select(`#input-value-${index}`).text(parseFloat(event.target.value).toFixed(3));
                    this.framework.render();
                });
            
            row.append("span")
                .attr("id", `input-value-${index}`)
                .style("min-width", "60px")
                .style("text-align", "right")
                .text(component.toFixed(3));
        });
        
        const buttons = content.append("div")
            .style("margin-top", "20px")
            .style("display", "flex")
            .style("gap", "10px")
            .style("justify-content", "center");
        
        buttons.append("button")
            .text("🎲 Randomize")
            .style("padding", "10px 15px")
            .style("border", "none")
            .style("border-radius", "5px")
            .style("background", "#3742fa")
            .style("color", "white")
            .style("cursor", "pointer")
            .on("click", () => {
                state.inputVector.components.forEach((_, index) => {
                    const newValue = (Math.random() - 0.5) * 2;
                    state.inputVector.components[index] = newValue;
                    d3.select(`#input-dim-${index}`).property("value", newValue);
                    d3.select(`#input-value-${index}`).text(newValue.toFixed(3));
                });
                this.framework.render();
            });
        
        buttons.append("button")
            .text("✅ Done")
            .style("padding", "10px 15px")
            .style("border", "none")
            .style("border-radius", "5px")
            .style("background", "#2ed573")
            .style("color", "white")
            .style("cursor", "pointer")
            .on("click", () => {
                modal.remove();
            });
        
        buttons.append("button")
            .text("❌ Remove Vector")
            .style("padding", "10px 15px")
            .style("border", "none")
            .style("border-radius", "5px")
            .style("background", "#ff4757")
            .style("color", "white")
            .style("cursor", "pointer")
            .on("click", () => {
                this.framework.getState().inputVector = null;
                modal.remove();
                this.framework.render();
            });
    }
    
    updateVectorDetails() {
        const detailsDiv = d3.select("#selected-vector");
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        if (!state.selectedVector && !state.inputVector) {
            detailsDiv.html("Click on a vector to see its properties, or add an input vector to see resonance forces");
            return;
        }
        
        let html = '';
        
        if (state.selectedVector) {
            html += this.generateSelectedVectorHTML(state.selectedVector, state.vectors, config);
        }
        
        if (state.inputVector) {
            html += this.generateInputVectorHTML(state.inputVector, state.vectors);
        }
        
        detailsDiv.html(html);
    }
    
    generateSelectedVectorHTML(selectedVector, vectors, config) {
        const forceCalculator = this.framework.getModules().forceCalculator;
        const magnitude = forceCalculator.magnitude(selectedVector);
        const entropy = forceCalculator.informationEntropy(selectedVector);
        const stability = forceCalculator.nuclearStability(selectedVector);
        const quantums = forceCalculator.getInformationQuantums(selectedVector);
        const stats = forceCalculator.getVectorStatistics(selectedVector);
        
        let html = `
            <div class="vector-info">
                <h4>${selectedVector.isUploaded ? 'Information Neuron' : 'Vector Atom'} ${selectedVector.id + 1}</h4>
                
                <div class="property-group">
                    <h5>🧮 Mathematical Properties</h5>
                    <div class="property-row">
                        <span class="property-label">Magnitude (Nuclear Mass):</span>
                        <span class="property-value">${magnitude.toFixed(4)}</span>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Information Entropy:</span>
                        <span class="property-value">${entropy.toFixed(4)} bits</span>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Nuclear Stability:</span>
                        <span class="property-value">${stability.toFixed(4)}</span>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Dimensions:</span>
                        <span class="property-value">${config.dimensions}D space</span>
                    </div>
                </div>

                <div class="property-group">
                    <h5>⚛️ Information Quantum Distribution</h5>
                    <div class="quantum-grid">
                        <div class="quantum-item excitatory">
                            <span class="quantum-count">${quantums.excitatory}</span>
                            <span class="quantum-label">Excitatory</span>
                            <span class="quantum-energy">${quantums.averageExcitation.toFixed(3)}</span>
                        </div>
                        <div class="quantum-item inhibitory">
                            <span class="quantum-count">${quantums.inhibitory}</span>
                            <span class="quantum-label">Inhibitory</span>
                            <span class="quantum-energy">${quantums.averageInhibition.toFixed(3)}</span>
                        </div>
                        <div class="quantum-item neutral">
                            <span class="quantum-count">${quantums.neutral}</span>
                            <span class="quantum-label">Neutral</span>
                            <span class="quantum-energy">0.000</span>
                        </div>
                    </div>
                </div>

                <div class="property-group">
                    <h5>📊 Statistical Analysis</h5>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Mean:</span>
                            <span class="stat-value">${stats.mean.toFixed(4)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Std Dev:</span>
                            <span class="stat-value">${stats.standardDeviation.toFixed(4)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Range:</span>
                            <span class="stat-value">${stats.range.toFixed(4)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Skewness:</span>
                            <span class="stat-value">${stats.skewness.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
        `;
        
        // Show component dimensions
        const showDims = Math.min(config.dimensions, Constants.MAX_DISPLAYED_DIMENSIONS);
        html += `<div class="property-group">
            <h5>🔬 Component Analysis</h5>`;
        
        for (let i = 0; i < showDims; i++) {
            const component = selectedVector.components[i];
            const absValue = Math.abs(component);
            const percentage = (absValue / 2) * 100; // Normalized to -2 to 2 range
            const polarity = component > 0.1 ? 'positive' : component < -0.1 ? 'negative' : 'neutral';
            
            html += `
                <div class="dimension-analysis">
                    <div class="dimension-header">
                        <span class="dimension-name">D${i + 1}</span>
                        <span class="dimension-polarity ${polarity}">${polarity.toUpperCase()}</span>
                        <span class="dimension-magnitude">${component.toFixed(4)}</span>
                    </div>
                    <div class="dimension-bar-container">
                        <div class="dimension-bar-fill ${polarity}" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
        
        if (config.dimensions > Constants.MAX_DISPLAYED_DIMENSIONS) {
            html += `<p class="more-dimensions">... and ${config.dimensions - Constants.MAX_DISPLAYED_DIMENSIONS} more dimensions</p>`;
        }
        html += '</div>';
        
        // Enhanced similarity rankings with quantum properties
        html += `<div class="property-group">
            <h5>🌌 Quantum Resonance Analysis</h5>
            <p class="analysis-description">Interaction forces with other vector atoms:</p>
        `;
        
        const similarities = vectors
            .filter(other => other.id !== selectedVector.id)
            .map(other => ({
                vector: other,
                resonanceForce: forceCalculator.resonanceForce(selectedVector, other),
                cosineSimilarity: forceCalculator.cosineSimilarity(selectedVector, other),
                correlation: forceCalculator.correlation(selectedVector, other),
                entanglement: forceCalculator.quantumEntanglement(selectedVector, other),
                harmonicAlignment: forceCalculator.harmonicAlignment(selectedVector, other),
                electromagneticForce: forceCalculator.electromagneticForce(selectedVector, other),
                gravitationalForce: forceCalculator.gravitationalAttraction(selectedVector, other),
                distance: Math.sqrt(forceCalculator.distanceSquared(selectedVector, other))
            }))
            .sort((a, b) => b.resonanceForce - a.resonanceForce);
        
        similarities.slice(0, Constants.MAX_DISPLAYED_SIMILARITIES).forEach((item, index) => {
            html += `
                <div class="resonance-analysis" onclick="framework.selectVector(${item.vector.id})">
                    <div class="resonance-header">
                        <strong class="vector-name">${item.vector.isUploaded ? 'N' : 'V'}${item.vector.id + 1}</strong>
                        <span class="rank-badge">#${index + 1}</span>
                    </div>
                    <div class="force-metrics">
                        <div class="metric-row">
                            <span class="metric-label">Resonance Force:</span>
                            <span class="metric-value primary">${item.resonanceForce.toFixed(6)}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Quantum Entanglement:</span>
                            <span class="metric-value">${item.entanglement.toFixed(4)}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Harmonic Alignment:</span>
                            <span class="metric-value">${item.harmonicAlignment.toFixed(4)}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Electromagnetic:</span>
                            <span class="metric-value">${item.electromagneticForce.toFixed(4)}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Gravitational:</span>
                            <span class="metric-value">${item.gravitationalForce.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }
    
    generateInputVectorHTML(inputVector, vectors) {
        const forceCalculator = this.framework.getModules().forceCalculator;
        const magnitude = forceCalculator.magnitude(inputVector);
        
        let html = `
            <div class="vector-info" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>🌟 Input Vector Analysis</h4>
                    <button onclick="framework.getModules().uiController.showInputEditor()" style="padding: 5px 10px; background: #ffd700; color: black; border: none; border-radius: 3px; cursor: pointer;">✏️ Edit</button>
                </div>
                <p><strong>Magnitude:</strong> ${magnitude.toFixed(3)}</p>
                <p><strong>Resonance Forces with Neurons:</strong></p>
        `;
        
        const forceData = vectors.map(v => ({
            vector: v,
            force: forceCalculator.resonanceForce(inputVector, v)
        })).sort((a, b) => b.force - a.force);
        
        forceData.slice(0, Constants.MAX_DISPLAYED_SIMILARITIES).forEach((item, index) => {
            html += `
                <div style="font-size: 0.9em; margin: 2px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                    <strong>${item.vector.isUploaded ? 'N' : 'V'}${item.vector.id + 1}:</strong> 
                    <span style="color: #ffd700">${item.force.toFixed(4)}</span>
                    ${index === 0 ? '<span style="color: #ff4757"> (Strongest)</span>' : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    getComponentColor(value) {
        if (Math.abs(value) < 0.1) return Constants.COLORS.NEUTRAL;
        return value > 0 ? Constants.COLORS.POSITIVE : Constants.COLORS.NEGATIVE;
    }
}
