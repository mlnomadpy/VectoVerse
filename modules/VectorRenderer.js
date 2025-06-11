import { Constants } from './Constants.js';

export class VectorRenderer {
    constructor(svg, framework) {
        this.svg = svg;
        this.framework = framework;
        this.d3 = window.d3; // Get D3 from global scope
        this.lastRenderState = null; // Track last rendered state to avoid unnecessary re-renders

        this.framework.eventBus.on('analysisCompleted', (result) => {
            this.handleAnalysisResults(result);
        });
        
        // Listen for vector selection events to update periodic table
        this.framework.eventBus.on('stateChanged', (eventData) => {
            if (eventData && eventData.reason === 'vectorSelected') {
                // Notify periodic table of selection
                if (this.framework.modules.periodicTableVisualization) {
                    const selectedVectorId = this.framework.getState().selectedVectorId;
                    if (selectedVectorId !== null) {
                        this.framework.modules.periodicTableVisualization.highlightElement(selectedVectorId);
                    }
                }
            }
        });
    }
    
    handleAnalysisResults(result) {
        if (result.type === 'kmeans') {
            const colors = this.d3.scaleOrdinal(this.d3.schemeCategory10);
            this.svg.selectAll(".vector-atom")
                .each(function(d, i) {
                    const clusterId = result.data.assignments[i];
                    d3.select(this).select('circle').style('fill', colors(clusterId));
                });
        } else if (result.type === 'pca' || result.type === 'tsne') {
            const projectedData = result.data;
            const state = this.framework.getState();
            const config = this.framework.getConfig();

            const xExtent = this.d3.extent(projectedData, d => d[0]);
            const yExtent = this.d3.extent(projectedData, d => d[1]);

            const xScale = this.d3.scaleLinear().domain(xExtent).range([50, config.width - 50]);
            const yScale = this.d3.scaleLinear().domain(yExtent).range([50, config.height - 50]);

            this.svg.selectAll(".vector-atom")
                .each(function(d, i) {
                    d.x = xScale(projectedData[i][0]);
                    d.y = yScale(projectedData[i][1]);
                })
                .transition()
                .duration(750)
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
        }
    }

    render(forceFullRender = false) {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        // Check if we need a full re-render or can do selective updates
        const needsFullRender = forceFullRender || this.needsFullRender(state, config);
        
        if (needsFullRender) {
            this.svg.selectAll("*").remove();
            this.renderBackgroundParticles();
            this.renderVectors();
            this.lastRenderState = this.getStateSnapshot(state, config);
        }
        
        // Always update forces and selection states (these are quick updates)
        this.updateForces();
        this.updateVectorSelection();
        this.updateInputVector();
    }
    
    needsFullRender(state, config) {
        if (!this.lastRenderState) return true;
        
        const currentSnapshot = this.getStateSnapshot(state, config);
        
        // Check if vectors count or dimensions changed
        if (currentSnapshot.vectorCount !== this.lastRenderState.vectorCount ||
            currentSnapshot.dimensions !== this.lastRenderState.dimensions ||
            currentSnapshot.width !== this.lastRenderState.width ||
            currentSnapshot.height !== this.lastRenderState.height) {
            return true;
        }
        
        // Check if vector IDs changed (new vectors generated)
        if (JSON.stringify(currentSnapshot.vectorIds) !== JSON.stringify(this.lastRenderState.vectorIds)) {
            return true;
        }
        
        return false;
    }
    
    getStateSnapshot(state, config) {
        return {
            vectorCount: state.vectors.length,
            dimensions: config.dimensions,
            width: config.width,
            height: config.height,
            vectorIds: state.vectors.map(v => v.id),
            hasInputVector: !!state.inputVector
        };
    }
    
    renderBackgroundParticles() {
        const config = this.framework.getConfig();
        const particles = this.d3.range(30).map(() => ({
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            r: Math.random() * 2 + 1
        }));
        
        this.svg.selectAll(".bg-particle")
            .data(particles)
            .enter()
            .append("circle")
            .attr("class", "bg-particle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r)
            .attr("fill", "rgba(255,255,255,0.1)")
            .attr("opacity", 0.3);
    }
    
    updateForces() {
        const config = this.framework.getConfig();
        
        // Remove existing force lines
        this.svg.selectAll(".force-line").remove();
        
        if (config.showForces) {
            this.renderForces();
        }
    }
    
    renderForces() {
        const state = this.framework.getState();
        const forceCalculator = this.framework.getModules().forceCalculator;
        const config = this.framework.getConfig();
        const forces = [];
        
        // Enhanced force calculation with multiple metrics
        for (let i = 0; i < state.vectors.length; i++) {
            for (let j = i + 1; j < state.vectors.length; j++) {
                const v1 = state.vectors[i];
                const v2 = state.vectors[j];
                
                // Calculate multiple similarity metrics
                const resonanceForce = forceCalculator.resonanceForce(v1, v2);
                const cosineSimilarity = Math.abs(forceCalculator.cosineSimilarity(v1, v2));
                const pearsonCorrelation = Math.abs(forceCalculator.correlation(v1, v2));
                const euclideanDistance = 1 / (1 + forceCalculator.euclideanDistance(v1, v2)); // Invert for visualization
                const manhattanDistance = 1 / (1 + this.calculateManhattanDistance(v1, v2)); // Invert for visualization
                const quantumEntanglement = forceCalculator.quantumEntanglement ? 
                    forceCalculator.quantumEntanglement(v1, v2) : Math.abs(pearsonCorrelation);
                
                // Use the selected metric from config or default to resonance
                let selectedForce = resonanceForce;
                let forceType = 'resonance';
                
                if (config.forceType) {
                    switch (config.forceType) {
                        case 'cosine':
                            selectedForce = cosineSimilarity;
                            forceType = 'cosine';
                            break;
                        case 'correlation':
                            selectedForce = pearsonCorrelation;
                            forceType = 'correlation';
                            break;
                        case 'euclidean':
                            selectedForce = euclideanDistance;
                            forceType = 'euclidean';
                            break;
                        case 'manhattan':
                            selectedForce = manhattanDistance;
                            forceType = 'manhattan';
                            break;
                        case 'quantum':
                            selectedForce = quantumEntanglement;
                            forceType = 'quantum';
                            break;
                        default:
                            selectedForce = resonanceForce;
                            forceType = 'resonance';
                    }
                }
                
                forces.push({
                    x1: v1.x, y1: v1.y,
                    x2: v2.x, y2: v2.y,
                    force: selectedForce,
                    type: 'normal',
                    forceType: forceType,
                    // Store all metric values for enhanced tooltips
                    allMetrics: {
                        resonance: resonanceForce,
                        cosine: cosineSimilarity,
                        correlation: pearsonCorrelation,
                        euclidean: euclideanDistance,
                        manhattan: manhattanDistance,
                        quantum: quantumEntanglement
                    }
                });
            }
        }
        
        // Forces from input vector to all vectors
        if (state.inputVector) {
            state.vectors.forEach(v => {
                const force = forceCalculator.resonanceForce(state.inputVector, v);
                forces.push({
                    x1: state.inputVector.x, y1: state.inputVector.y,
                    x2: v.x, y2: v.y,
                    force: force,
                    type: 'input',
                    forceType: 'input-resonance'
                });
            });
        }
        
        const maxForce = forces.length > 0 ? Math.max(...forces.map(f => f.force)) : 1;
        
        const forceLines = this.svg.selectAll(".force-line")
            .data(forces)
            .enter()
            .append("line")
            .attr("class", d => `force-line ${d.force > maxForce * 0.5 ? "strong" : ""} force-${d.forceType}`)
            .attr("x1", d => d.x1)
            .attr("y1", d => d.y1)
            .attr("x2", d => d.x2)
            .attr("y2", d => d.y2)
            .style("stroke", d => this.getForceColor(d))
            .style("stroke-width", d => Math.max(1, (d.force / maxForce) * 6))
            .attr("data-base-opacity", d => 0.3 + (d.force / maxForce) * 0.5)
            .style("opacity", d => 0.3 + (d.force / maxForce) * 0.5)
            .style("stroke-dasharray", d => this.getForcePattern(d.forceType))
            .on("mouseenter", (event, d) => this.showForceTooltip(event, d))
            .on("mouseleave", () => this.hideForceTooltip());
    }
    
    renderVectors() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        const vectorGroups = this.svg.selectAll(".vector-atom")
            .data(state.vectors, d => d.id) // Use id as key for data binding
            .enter()
            .append("g")
            .attr("class", "vector-atom")
            .attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`)
            .attr("tabindex", "0")
            .attr("role", "button")
            .attr("aria-label", d => `Vector ${d.id + 1}, magnitude ${this.framework.getModules().forceCalculator.magnitude(d).toFixed(2)}`)
            .on("click", (event, d) => {
                event.stopPropagation(); // Prevent event bubbling
                this.framework.selectVector(d.id);
            })
            .on("keydown", (event, d) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.framework.selectVector(d.id);
                }
            })
;
        
        // Add glow filter (only if it doesn't exist)
        if (this.svg.select("defs").empty()) {
            const defs = this.svg.append("defs");
            const filter = defs.append("filter").attr("id", "glow");
            filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        }
        
        // Main circle with glow effect
        vectorGroups.append("circle")
            .attr("r", d => this.getVectorRadius(d))
            .attr("fill", d => d.customColor ? d.customColor : (d.isUploaded ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.1)"))
            .attr("stroke", d => d.isUploaded ? Constants.COLORS.UPLOADED : "rgba(255,255,255,0.5)")
            .attr("stroke-width", 2)
            .attr("filter", "url(#glow)");
        
        // Dimension segments
        vectorGroups.each((d, i, nodes) => {
            const group = d3.select(nodes[i]);
            const radius = this.getVectorRadius(d);
            const angleStep = (2 * Math.PI) / config.dimensions;
            
            d.components.forEach((component, dimIndex) => {
                const angle = dimIndex * angleStep - Math.PI / 2;
                const intensity = Math.abs(component);
                const segmentRadius = radius * 0.8;
                
                const arc = d3.arc()
                    .innerRadius(segmentRadius - 8)
                    .outerRadius(segmentRadius - 2)
                    .startAngle(angle - angleStep * 0.4)
                    .endAngle(angle + angleStep * 0.4);
                
                group.append("path")
                    .attr("d", arc)
                    .attr("fill", this.getComponentColor(component))
                    .attr("opacity", 0.3 + intensity * 0.7)
                    .attr("class", "dimension-segment");
                
                // Dimension labels for smaller dimension counts
                if (config.dimensions <= 10) {
                    const textX = Math.cos(angle) * (radius + 15);
                    const textY = Math.sin(angle) * (radius + 15);
                    
                    group.append("text")
                        .attr("x", textX)
                        .attr("y", textY)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle")
                        .attr("fill", "white")
                        .attr("font-size", "8px")
                        .attr("opacity", 0.8)
                        .text(`D${dimIndex + 1}`);
                }
            });
        });
        
        // Vector ID labels
        vectorGroups.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("font-size", "14px")
            .text(d => d.isUploaded ? `N${d.id + 1}` : `V${d.id + 1}`);
        
        this.setupKeyboardNavigation();
    }
    
    updateInputVector() {
        const state = this.framework.getState();
        
        // Remove existing input vector
        this.svg.select(".input-vector").remove();
        
        if (state.inputVector) {
            this.renderInputVector();
        }
    }
    
    renderInputVector() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        const inputGroup = this.svg.append("g")
            .attr("class", "input-vector")
            .attr("transform", `translate(${state.inputVector.x || 0}, ${state.inputVector.y || 0})`);
        
        const radius = this.getVectorRadius(state.inputVector);
        
        // Pulsing outer ring
        inputGroup.append("circle")
            .attr("r", radius + 10)
            .attr("fill", "none")
            .attr("stroke", Constants.COLORS.INPUT)
            .attr("stroke-width", 2)
            .attr("opacity", 0.5)
            .attr("class", "input-pulse");
        
        // Main circle
        inputGroup.append("circle")
            .attr("r", radius)
            .attr("fill", "rgba(255,215,0,0.3)")
            .attr("stroke", Constants.COLORS.INPUT)
            .attr("stroke-width", 3);
        
        // Dimension segments
        const angleStep = (2 * Math.PI) / config.dimensions;
        state.inputVector.components.forEach((component, dimIndex) => {
            const angle = dimIndex * angleStep - Math.PI / 2;
            const intensity = Math.abs(component);
            const segmentRadius = radius * 0.8;
            
            const arc = d3.arc()
                .innerRadius(segmentRadius - 8)
                .outerRadius(segmentRadius - 2)
                .startAngle(angle - angleStep * 0.4)
                .endAngle(angle + angleStep * 0.4);
            
            inputGroup.append("path")
                .attr("d", arc)
                .attr("fill", this.getComponentColor(component))
                .attr("opacity", 0.5 + intensity * 0.5);
        });
        
        // Label
        inputGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", Constants.COLORS.INPUT)
            .attr("font-weight", "bold")
            .attr("font-size", "16px")
            .text("INPUT");
    }
    
    updateVectorSelection() {
        const { selectedVectorId } = this.framework.getState();
        this.svg.selectAll(".vector-atom")
            .classed("selected", d => d.id === selectedVectorId);
    }
    
    getVectorRadius(vector) {
        const magnitude = this.framework.getModules().forceCalculator.magnitude(vector);
        const radius = Math.max(Constants.MIN_VECTOR_RADIUS, Math.min(Constants.MAX_VECTOR_RADIUS, magnitude * 25));
        const scale = vector.scale || 1.0;
        return radius * scale;
    }

    calculateManhattanDistance(v1, v2) {
        let distance = 0;
        for (let i = 0; i < v1.components.length; i++) {
            distance += Math.abs(v1.components[i] - v2.components[i]);
        }
        return distance;
    }

    getForceColor(forceData) {
        if (forceData.type === 'input') {
            return Constants.COLORS.INPUT;
        }
        
        switch (forceData.forceType) {
            case 'cosine':
                return "#e74c3c"; // Red for cosine similarity
            case 'correlation':
                return "#3498db"; // Blue for correlation
            case 'euclidean':
                return "#9b59b6"; // Purple for Euclidean distance
            case 'manhattan':
                return "#f39c12"; // Orange for Manhattan distance
            case 'quantum':
                return "#1abc9c"; // Teal for quantum entanglement
            case 'resonance':
            default:
                return "#ff6b6b"; // Default red for resonance
        }
    }

    getForcePattern(forceType) {
        switch (forceType) {
            case 'cosine':
                return "none";
            case 'correlation':
                return "6,3";
            case 'euclidean':
                return "8,4";
            case 'manhattan':
                return "4,2";
            case 'quantum':
                return "2,2";
            case 'resonance':
            default:
                return "none";
        }
    }

    showForceTooltip(event, forceData) {
        const tooltip = this.d3.select('body')
            .append('div')
            .attr('class', 'force-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '11px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)');

        const metricNames = {
            'cosine': 'Cosine Similarity',
            'correlation': 'Pearson Correlation',
            'euclidean': 'Euclidean Distance',
            'manhattan': 'Manhattan Distance',
            'quantum': 'Quantum Entanglement',
            'resonance': 'Resonance Force'
        };
        
        let content = `<div><strong>${metricNames[forceData.forceType] || forceData.forceType.toUpperCase()}</strong></div>`;
        content += `<div>Value: ${forceData.force.toFixed(4)}</div>`;
        
        if (forceData.allMetrics) {
            content += `<div style="margin-top: 5px; font-size: 10px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px;">`;
            content += `<div>📊 All Metrics:</div>`;
            content += `<div>Resonance: ${forceData.allMetrics.resonance.toFixed(3)}</div>`;
            content += `<div>Cosine: ${forceData.allMetrics.cosine.toFixed(3)}</div>`;
            content += `<div>Correlation: ${forceData.allMetrics.correlation.toFixed(3)}</div>`;
            content += `<div>Euclidean: ${forceData.allMetrics.euclidean.toFixed(3)}</div>`;
            content += `<div>Manhattan: ${forceData.allMetrics.manhattan.toFixed(3)}</div>`;
            content += `<div>Quantum: ${forceData.allMetrics.quantum.toFixed(3)}</div>`;
            content += `</div>`;
        }

        tooltip.html(content);

        const [mouseX, mouseY] = this.d3.pointer(event, document.body);
        tooltip
            .style('left', (mouseX + 10) + 'px')
            .style('top', (mouseY - 10) + 'px');
    }

    hideForceTooltip() {
        this.d3.selectAll('.force-tooltip').remove();
    }
    
    getComponentColor(value) {
        if (Math.abs(value) < 0.1) return Constants.COLORS.NEUTRAL;
        return value > 0 ? Constants.COLORS.POSITIVE : Constants.COLORS.NEGATIVE;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.modal-overlay') || e.target.tagName === 'INPUT') return;
            
            const state = this.framework.getState();
            const vectors = state.vectors;
            const currentIndex = vectors.findIndex(v => v.id === state.selectedVectorId);
            
            let newIndex = -1;
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = currentIndex < vectors.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = currentIndex > 0 ? currentIndex - 1 : vectors.length - 1;
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = vectors.length - 1;
                    break;
            }
            
            if (newIndex >= 0 && newIndex < vectors.length) {
                this.framework.selectVector(vectors[newIndex].id);
                // Focus the selected vector
                const vectorElement = this.svg.select(`.vector-atom[data-id="${vectors[newIndex].id}"]`).node();
                if (vectorElement) vectorElement.focus();
            }
        });
    }


}
