import { Constants } from './Constants.js';

export class PeriodicTableVisualization {
    constructor(container, framework) {
        this.container = container;
        this.framework = framework;
        this.d3 = window.d3;
        this.svg = null;
        this.periodicData = [];
        this.selectedElement = null;
        
        // Check if D3.js is loaded
        if (!this.d3) {
            console.error('D3.js is not loaded. PeriodicTableVisualization requires D3.js.');
            return;
        }
        
        // Periodic table layout configuration
        this.config = {
            elementWidth: 60,
            elementHeight: 60,
            padding: 2,
            maxColumns: 18, // Standard periodic table width
            fontSize: 10,
            symbolFontSize: 14
        };
        
        this.init();
    }

    init() {
        this.createPeriodicTableContainer();
        this.setupEventListeners();
    }

    createPeriodicTableContainer() {
        // Create SVG container for periodic table
        const containerRect = this.container.getBoundingClientRect();
        const tableHeight = 200; // Fixed height for periodic table
        
        this.svg = this.d3.select(this.container)
            .append('div')
            .attr('class', 'periodic-table-container')
            .style('width', '100%')
            .style('height', `${tableHeight}px`)
            .style('background', 'rgba(0,0,0,0.1)')
            .style('border-top', '2px solid rgba(255,255,255,0.2)')
            .style('padding', '10px')
            .style('overflow-x', 'auto')
            .style('overflow-y', 'hidden')
            .append('svg')
            .attr('width', '100%')
            .attr('height', tableHeight - 20)
            .attr('class', 'periodic-table-svg');

        // Add title
        this.svg.append('text')
            .attr('x', 20)
            .attr('y', 20)
            .attr('fill', 'white')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text('🧪 Vector Periodic Table');
    }

    setupEventListeners() {
        // Listen for vector updates
        this.framework.eventBus.on('stateChanged', () => {
            this.updatePeriodicTable();
        });

        // Listen for vector selection
        this.framework.eventBus.on('vectorSelected', (data) => {
            this.highlightElement(data.vectorId);
        });
    }

    updatePeriodicTable() {
        // Safety check for D3.js
        if (!this.d3 || !this.svg) {
            return;
        }
        
        const state = this.framework.getState();
        const vectors = state.vectors;
        
        if (!vectors || vectors.length === 0) {
            this.clearTable();
            return;
        }

        // Convert vectors to periodic elements
        this.periodicData = this.vectorsToPeriodicElements(vectors);
        this.renderPeriodicTable();
    }

    vectorsToPeriodicElements(vectors) {
        const forceCalculator = this.framework.getModules().forceCalculator;
        
        return vectors.map((vector, index) => {
            const stats = forceCalculator.getVectorStatistics(vector);
            const quantumData = forceCalculator.getInformationQuantums(vector);
            
            // Create element properties based on vector characteristics
            const element = {
                id: vector.id,
                symbol: this.generateElementSymbol(vector, index),
                name: `Vector ${vector.id + 1}`,
                atomicNumber: vector.id + 1,
                atomicMass: Math.round(stats.magnitude * 100) / 100,
                
                // Quantum properties
                excitatory: quantumData.excitatory,
                inhibitory: quantumData.inhibitory,
                neutral: quantumData.neutral,
                
                // Statistical properties
                entropy: Math.round(forceCalculator.informationEntropy(vector) * 1000) / 1000,
                stability: Math.round(forceCalculator.nuclearStability(vector) * 1000) / 1000,
                
                // Visual properties
                color: this.getElementColor(vector, stats, quantumData),
                position: this.calculateElementPosition(vector, index, vectors.length),
                
                // Original vector reference
                vector: vector
            };
            
            return element;
        });
    }

    generateElementSymbol(vector, index) {
        // Generate 1-2 letter symbols based on vector properties
        const magnitude = this.framework.getModules().forceCalculator.magnitude(vector);
        const entropy = this.framework.getModules().forceCalculator.informationEntropy(vector);
        
        // Use magnitude and entropy to determine symbol characteristics
        const firstLetter = String.fromCharCode(65 + (index % 26)); // A-Z
        
        if (magnitude > 1.5) {
            return firstLetter + 'h'; // High magnitude
        } else if (entropy > 2.0) {
            return firstLetter + 'e'; // High entropy
        } else if (magnitude < 0.5) {
            return firstLetter + 'l'; // Low magnitude
        } else {
            return firstLetter + 'm'; // Medium
        }
    }

    getElementColor(vector, stats, quantumData) {
        // Color based on dominant quantum property
        if (quantumData.excitatory > quantumData.inhibitory && quantumData.excitatory > quantumData.neutral) {
            return '#ff6b6b'; // Red for excitatory
        } else if (quantumData.inhibitory > quantumData.excitatory && quantumData.inhibitory > quantumData.neutral) {
            return '#4ecdc4'; // Cyan for inhibitory
        } else if (quantumData.neutral > quantumData.excitatory && quantumData.neutral > quantumData.inhibitory) {
            return '#95a5a6'; // Gray for neutral
        } else {
            return '#f39c12'; // Orange for balanced
        }
    }

    calculateElementPosition(vector, index, totalVectors) {
        // Arrange elements in periodic table layout
        const maxCols = Math.min(this.config.maxColumns, Math.ceil(Math.sqrt(totalVectors * 2)));
        const row = Math.floor(index / maxCols);
        const col = index % maxCols;
        
        return {
            row: row,
            col: col,
            x: 50 + col * (this.config.elementWidth + this.config.padding),
            y: 40 + row * (this.config.elementHeight + this.config.padding)
        };
    }

    renderPeriodicTable() {
        // Safety check for D3.js and SVG
        if (!this.d3 || !this.svg) {
            return;
        }
        
        // Clear existing elements
        this.svg.selectAll('.periodic-element').remove();
        
        // Create element groups
        const elements = this.svg.selectAll('.periodic-element')
            .data(this.periodicData, d => d.id)
            .enter()
            .append('g')
            .attr('class', 'periodic-element')
            .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                this.framework.selectVector(d.id);
            })
            .on('mouseenter', (event, d) => {
                this.showElementTooltip(event, d);
            })
            .on('mouseleave', () => {
                this.hideElementTooltip();
            });

        // Element background rectangles
        elements.append('rect')
            .attr('width', this.config.elementWidth)
            .attr('height', this.config.elementHeight)
            .attr('fill', d => d.color)
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-width', 1)
            .attr('rx', 4)
            .attr('opacity', 0.8);

        // Atomic number (top-left)
        elements.append('text')
            .attr('x', 4)
            .attr('y', 12)
            .attr('fill', 'white')
            .attr('font-size', this.config.fontSize)
            .attr('font-weight', 'bold')
            .text(d => d.atomicNumber);

        // Element symbol (center)
        elements.append('text')
            .attr('x', this.config.elementWidth / 2)
            .attr('y', this.config.elementHeight / 2 + 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-size', this.config.symbolFontSize)
            .attr('font-weight', 'bold')
            .text(d => d.symbol);

        // Atomic mass (bottom)
        elements.append('text')
            .attr('x', this.config.elementWidth / 2)
            .attr('y', this.config.elementHeight - 6)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(255,255,255,0.8)')
            .attr('font-size', this.config.fontSize - 1)
            .text(d => d.atomicMass);

        // Quantum indicators (small dots)
        this.addQuantumIndicators(elements);
    }

    addQuantumIndicators(elements) {
        // Add small indicators for quantum properties
        const elementHeight = this.config.elementHeight;
        
        elements.each(function(d) {
            const element = d3.select(this);
            const indicatorSize = 3;
            const spacing = 4;
            
            // Excitatory indicators (red dots)
            for (let i = 0; i < Math.min(d.excitatory, 5); i++) {
                element.append('circle')
                    .attr('cx', 4 + i * spacing)
                    .attr('cy', elementHeight - 16)
                    .attr('r', indicatorSize)
                    .attr('fill', '#ff4757')
                    .attr('opacity', 0.7);
            }
            
            // Inhibitory indicators (blue dots)
            for (let i = 0; i < Math.min(d.inhibitory, 5); i++) {
                element.append('circle')
                    .attr('cx', 4 + i * spacing)
                    .attr('cy', elementHeight - 24)
                    .attr('r', indicatorSize)
                    .attr('fill', '#3742fa')
                    .attr('opacity', 0.7);
            }
        });
    }

    highlightElement(vectorId) {
        this.svg.selectAll('.periodic-element')
            .classed('selected', false)
            .select('rect')
            .attr('stroke-width', 1)
            .attr('stroke', 'rgba(255,255,255,0.3)');
            
        this.svg.selectAll('.periodic-element')
            .filter(d => d.id === vectorId)
            .classed('selected', true)
            .select('rect')
            .attr('stroke-width', 3)
            .attr('stroke', '#ffd700');
    }

    showElementTooltip(event, element) {
        const tooltip = this.d3.select('body')
            .append('div')
            .attr('class', 'periodic-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)')
            .html(`
                <div><strong>${element.name}</strong></div>
                <div>Symbol: ${element.symbol}</div>
                <div>Atomic Mass: ${element.atomicMass}</div>
                <div>Entropy: ${element.entropy}</div>
                <div>Stability: ${element.stability}</div>
                <div>Excitatory: ${element.excitatory}</div>
                <div>Inhibitory: ${element.inhibitory}</div>
                <div>Neutral: ${element.neutral}</div>
            `);

        const [mouseX, mouseY] = this.d3.pointer(event, document.body);
        tooltip
            .style('left', (mouseX + 10) + 'px')
            .style('top', (mouseY - 10) + 'px');
    }

    hideElementTooltip() {
        this.d3.selectAll('.periodic-tooltip').remove();
    }

    clearTable() {
        this.svg.selectAll('.periodic-element').remove();
    }

    // Public methods for external control
    setElementHighlight(vectorId, highlight = true) {
        if (highlight) {
            this.highlightElement(vectorId);
        } else {
            this.svg.selectAll('.periodic-element')
                .classed('selected', false)
                .select('rect')
                .attr('stroke-width', 1)
                .attr('stroke', 'rgba(255,255,255,0.3)');
        }
    }

    getElementData(vectorId) {
        return this.periodicData.find(element => element.id === vectorId);
    }

    exportPeriodicData() {
        return {
            elements: this.periodicData,
            timestamp: new Date().toISOString(),
            totalElements: this.periodicData.length
        };
    }
} 