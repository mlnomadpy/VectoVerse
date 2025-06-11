// Enhanced Tutorial System for VectoVerse
export class TutorialManager {
    constructor(framework) {
        this.framework = framework;
        this.d3 = window.d3; // Get D3 from global scope
        this.currentStep = 0;
        this.isActive = false;
        this.steps = this.createTutorialSteps();
        this.overlay = null;
        this.init();
    }

    init() {
        this.createTutorialModal();
        this.setupEventListeners();
    }

    createTutorialSteps() {
        return [
            {
                title: "Welcome to the Vectoverse! 🌌",
                content: "Welcome to an interactive environment for visualizing n-dimensional vectors as 'information atoms'. Let's explore the atomic-inspired world of vector mathematics!",
                target: null,
                action: null,
                highlight: false
            },
            {
                title: "Understanding Vector Atoms ⚛️",
                content: "Each glowing sphere represents a vector in n-dimensional space. The size represents magnitude (like atomic mass) and the pulsing represents energy states.",
                target: "#main-viz",
                action: null,
                highlight: true
            },
            {
                title: "Vector Components 🔢",
                content: "Click on any vector to see its components and properties. Each component is like an electron with positive or negative charge.",
                target: ".vector-atom",
                action: "clickVector",
                highlight: true
            },
            {
                title: "Generating New Vectors 🎲",
                content: "Use the 'Generate Vectors' button to create new random vectors. Try changing the number of dimensions and vectors first!",
                target: "#regenerate",
                action: null,
                highlight: true
            },
            {
                title: "Resonance Forces ⚡",
                content: "Toggle resonance forces to see how vectors interact. Like atomic forces, vectors with similar directions attract each other!",
                target: "#toggle-forces",
                action: "toggleForces",
                highlight: true
            },
            {
                title: "Vector Operations 🛠️",
                content: "Use the new vector operation tools to normalize, randomize, or manipulate your vectors in real-time.",
                target: ".btn-toolbar",
                action: null,
                highlight: true
            },
            {
                title: "Input Test Vector 🎯",
                content: "Add a test vector to compare with your dataset. You can edit its components and see how it relates to other vectors.",
                target: "#add-input-vector",
                action: "addInputVector",
                highlight: true
            },
            {
                title: "Export Your Data 📁",
                content: "Export your vectors in multiple formats: JSON, CSV, Python, LaTeX, and more! Perfect for research and analysis.",
                target: "#export-json",
                action: null,
                highlight: true
            },
            {
                title: "Mathematical Insights 🎓",
                content: "Check the analysis panel for detailed mathematical properties including entropy, correlations, and quantum-inspired measures.",
                target: ".vector-details",
                action: null,
                highlight: true
            },
            {
                title: "You're Ready to Explore! 🚀",
                content: "Congratulations! You now understand the basics of VectoVerse. Explore different dimensions, analyze patterns, and discover the hidden relationships in vector space!",
                target: null,
                action: null,
                highlight: false
            }
        ];
    }

    createTutorialModal() {
        // Remove existing tutorial modal
        d3.select('#tutorial-modal').remove();
        
        const modal = d3.select('body').append('div')
            .attr('id', 'tutorial-modal')
            .attr('class', 'tutorial-modal')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('z-index', '2000')
            .style('display', 'none')
            .style('opacity', '0')
            .style('transition', 'opacity 0.3s ease');

        const content = modal.append('div')
            .attr('class', 'tutorial-content')
            .style('position', 'absolute')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
            .style('color', 'white')
            .style('padding', '30px')
            .style('border-radius', '20px')
            .style('max-width', '500px')
            .style('width', '90%')
            .style('box-shadow', '0 20px 40px rgba(0,0,0,0.3)')
            .style('text-align', 'center');

        // Progress bar
        const progressContainer = content.append('div')
            .style('width', '100%')
            .style('height', '4px')
            .style('background', 'rgba(255,255,255,0.3)')
            .style('border-radius', '2px')
            .style('margin-bottom', '20px');

        progressContainer.append('div')
            .attr('class', 'tutorial-progress')
            .style('height', '100%')
            .style('background', 'rgba(255,255,255,0.8)')
            .style('border-radius', '2px')
            .style('width', '0%')
            .style('transition', 'width 0.3s ease');

        // Step indicator
        content.append('div')
            .attr('class', 'tutorial-step-indicator')
            .style('font-size', '0.9em')
            .style('opacity', '0.8')
            .style('margin-bottom', '15px');

        // Title
        content.append('h2')
            .attr('class', 'tutorial-title')
            .style('margin', '0 0 15px 0')
            .style('font-size', '1.5em');

        // Content
        content.append('p')
            .attr('class', 'tutorial-text')
            .style('margin', '0 0 25px 0')
            .style('line-height', '1.6')
            .style('font-size', '1.1em');

        // Buttons
        const buttonContainer = content.append('div')
            .style('display', 'flex')
            .style('justify-content', 'space-between')
            .style('align-items', 'center')
            .style('gap', '15px');

        buttonContainer.append('button')
            .attr('class', 'tutorial-btn tutorial-prev')
            .style('padding', '10px 20px')
            .style('border', '2px solid rgba(255,255,255,0.5)')
            .style('background', 'transparent')
            .style('color', 'white')
            .style('border-radius', '25px')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .text('← Previous')
            .on('click', () => this.previousStep());

        buttonContainer.append('button')
            .attr('class', 'tutorial-btn tutorial-skip')
            .style('padding', '8px 16px')
            .style('border', 'none')
            .style('background', 'rgba(255,255,255,0.2)')
            .style('color', 'white')
            .style('border-radius', '15px')
            .style('cursor', 'pointer')
            .style('font-size', '0.9em')
            .text('Skip Tutorial')
            .on('click', () => this.endTutorial());

        buttonContainer.append('button')
            .attr('class', 'tutorial-btn tutorial-next')
            .style('padding', '10px 20px')
            .style('border', 'none')
            .style('background', 'rgba(255,255,255,0.9)')
            .style('color', '#667eea')
            .style('border-radius', '25px')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .text('Next →')
            .on('click', () => this.nextStep());

        // Close button
        content.append('button')
            .attr('class', 'tutorial-close')
            .style('position', 'absolute')
            .style('top', '10px')
            .style('right', '15px')
            .style('background', 'none')
            .style('border', 'none')
            .style('color', 'white')
            .style('font-size', '1.5em')
            .style('cursor', 'pointer')
            .style('opacity', '0.7')
            .text('×')
            .on('click', () => this.endTutorial());
    }

    setupEventListeners() {
        // Show tutorial on help button click
        d3.select('#show-help').on('click', () => this.startTutorial());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousStep();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.endTutorial();
            }
        });
    }

    startTutorial() {
        this.isActive = true;
        this.currentStep = 0;
        this.showModal();
        this.updateStep();
        
        // Track tutorial start
        this.trackEvent('tutorial_started');
    }

    showModal() {
        const modal = d3.select('#tutorial-modal');
        modal.style('display', 'block');
        setTimeout(() => modal.style('opacity', '1'), 10);
    }

    hideModal() {
        const modal = d3.select('#tutorial-modal');
        modal.style('opacity', '0');
        setTimeout(() => modal.style('display', 'none'), 300);
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStep();
            this.performStepAction();
        } else {
            this.endTutorial();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        const step = this.steps[this.currentStep];
        
        // Update progress bar
        const progress = ((this.currentStep + 1) / this.steps.length) * 100;
        d3.select('.tutorial-progress').style('width', `${progress}%`);
        
        // Update step indicator
        d3.select('.tutorial-step-indicator')
            .text(`Step ${this.currentStep + 1} of ${this.steps.length}`);
        
        // Update content
        d3.select('.tutorial-title').text(step.title);
        d3.select('.tutorial-text').text(step.content);
        
        // Update button states
        d3.select('.tutorial-prev').style('opacity', this.currentStep === 0 ? '0.5' : '1');
        d3.select('.tutorial-next').text(
            this.currentStep === this.steps.length - 1 ? 'Finish 🎉' : 'Next →'
        );
        
        // Handle highlighting
        this.clearHighlights();
        if (step.highlight && step.target) {
            this.highlightElement(step.target);
        }
        
        // Track step progress
        this.trackEvent('tutorial_step', { step: this.currentStep + 1 });
    }

    performStepAction() {
        const step = this.steps[this.currentStep];
        
        switch (step.action) {
            case 'clickVector':
                // Automatically select the first vector after a delay
                setTimeout(() => {
                    const firstVector = this.framework.getState().vectors[0];
                    if (firstVector) {
                        this.framework.selectVector(firstVector.id);
                    }
                }, 1000);
                break;
                
            case 'toggleForces':
                // Automatically toggle forces to demonstrate
                setTimeout(() => {
                    this.framework.updateConfig('showForces', true);
                }, 1000);
                break;
                
            case 'addInputVector':
                // Add an input vector automatically
                setTimeout(() => {
                    this.framework.addInputVector();
                }, 1000);
                break;
        }
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        
        // Create highlight overlay
        const highlight = d3.select('body').append('div')
            .attr('class', 'tutorial-highlight')
            .style('position', 'fixed')
            .style('top', `${rect.top - 10}px`)
            .style('left', `${rect.left - 10}px`)
            .style('width', `${rect.width + 20}px`)
            .style('height', `${rect.height + 20}px`)
            .style('border', '3px solid #ffd700')
            .style('border-radius', '10px')
            .style('box-shadow', '0 0 20px rgba(255, 215, 0, 0.5)')
            .style('pointer-events', 'none')
            .style('z-index', '1999')
            .style('animation', 'pulse 2s infinite');
        
        // Add pulse animation
        if (!document.querySelector('#tutorial-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'tutorial-pulse-style';
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
                    100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    clearHighlights() {
        d3.selectAll('.tutorial-highlight').remove();
    }

    endTutorial() {
        this.isActive = false;
        this.clearHighlights();
        this.hideModal();
        
        // Mark tutorial as completed
        localStorage.setItem('vectoverse-tutorial-completed', 'true');
        
        // Track completion
        this.trackEvent('tutorial_completed', { 
            completed_steps: this.currentStep + 1,
            total_steps: this.steps.length 
        });
        
        // Show completion message
        setTimeout(() => {
            const toast = this.framework.getModules().uiController.buttonManager;
            if (toast) {
                toast.showToast('Tutorial completed! Happy exploring! 🚀', 'success');
            }
        }, 500);
    }

    trackEvent(eventName, data = {}) {
        // Analytics tracking (placeholder)
        console.log(`Tutorial Event: ${eventName}`, data);
        
        // Could integrate with analytics services here
        if (window.gtag) {
            window.gtag('event', eventName, {
                custom_parameter: data
            });
        }
    }

    // Check if user should see tutorial
    shouldShowTutorial() {
        const hasSeenTutorial = localStorage.getItem('vectoverse-tutorial-completed');
        const hasVisited = localStorage.getItem('vectoverse-visited');
        
        return !hasSeenTutorial && !hasVisited;
    }

    // Auto-start tutorial for new users
    autoStartIfNew() {
        if (this.shouldShowTutorial()) {
            setTimeout(() => {
                this.startTutorial();
                localStorage.setItem('vectoverse-visited', 'true');
            }, 2000);
        }
    }
}
