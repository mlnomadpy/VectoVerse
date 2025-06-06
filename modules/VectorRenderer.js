import { Constants } from './Constants.js';

export class VectorRenderer {
    constructor(svg, framework) {
        this.svg = svg;
        this.framework = framework;
        this.d3 = window.d3; // Get D3 from global scope

        this.framework.eventBus.on('analysisCompleted', (result) => {
            this.handleAnalysisResults(result);
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

    render() {
        this.svg.selectAll("*").remove();
        
        this.renderBackgroundParticles();
        
        const config = this.framework.getConfig();
        if (config.showForces) {
            this.renderForces();
        }
        
        this.renderVectors();
        
        const state = this.framework.getState();
        if (state.inputVector) {
            this.renderInputVector();
        }
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
    
    renderForces() {
        const state = this.framework.getState();
        const forceCalculator = this.framework.getModules().forceCalculator;
        const forces = [];
        
        // Forces between regular vectors
        for (let i = 0; i < state.vectors.length; i++) {
            for (let j = i + 1; j < state.vectors.length; j++) {
                const v1 = state.vectors[i];
                const v2 = state.vectors[j];
                const force = forceCalculator.resonanceForce(v1, v2);
                
                forces.push({
                    x1: v1.x, y1: v1.y,
                    x2: v2.x, y2: v2.y,
                    force: force,
                    type: 'normal'
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
                    type: 'input'
                });
            });
        }
        
        const maxForce = Math.max(...forces.map(f => f.force));
        
        this.svg.selectAll(".force-line")
            .data(forces)
            .enter()
            .append("line")
            .attr("class", d => `force-line ${d.force > maxForce * 0.5 ? "strong" : ""}`)
            .attr("x1", d => d.x1)
            .attr("y1", d => d.y1)
            .attr("x2", d => d.x2)
            .attr("y2", d => d.y2)
            .style("stroke", d => d.type === 'input' ? Constants.COLORS.INPUT : "#ff6b6b")
            .style("stroke-width", d => Math.max(1, (d.force / maxForce) * 5))
            .attr("data-base-opacity", d => 0.3 + (d.force / maxForce) * 0.5)
            .style("opacity", d => 0.3 + (d.force / maxForce) * 0.5);
    }
    
    renderVectors() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        const vectorGroups = this.svg.selectAll(".vector-atom")
            .data(state.vectors)
            .enter()
            .append("g")
            .attr("class", "vector-atom")
            .attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`)
            .on("click", (event, d) => {
                this.framework.selectVector(d.id);
            });
        
        // Add glow filter
        const defs = this.svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        
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
        
        this.updateVectorSelection();
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
    
    getComponentColor(value) {
        if (Math.abs(value) < 0.1) return Constants.COLORS.NEUTRAL;
        return value > 0 ? Constants.COLORS.POSITIVE : Constants.COLORS.NEGATIVE;
    }
}
