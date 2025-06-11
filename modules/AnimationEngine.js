
import { Constants } from './Constants.js';

export class AnimationEngine {
    constructor(svg, framework) {
        this.svg = svg;
        this.framework = framework;
        this.pulseTime = 0;
        this.animationId = null;
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const animate = () => {
            if (!this.isRunning) return;
            
            this.pulseTime += Constants.ANIMATION.PULSE_SPEED;
            this.updateAnimations();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    updateAnimations() {
        try {
            this.updateVectorPulse();
            this.updateInputVectorFloat();
            this.updateForceLineAnimation();
        } catch (error) {
            console.warn('Animation update error:', error);
        }
    }
    
    updateVectorPulse() {
        const state = this.framework.getState();
        const pulseTime = this.pulseTime; // Capture pulseTime in local scope
        
        this.svg.selectAll(".vector-atom circle")
            .each(function(d) {
                const element = window.d3.select(this);
                
                const baseWidth = d.id === state.selectedVectorId ? 4 : 2;
                const pulse = Math.sin(pulseTime + (d.id || 0)) * 0.3 + 1; // Reduced pulse intensity
                element.attr("stroke-width", baseWidth + pulse * 0.5); // Reduced pulse magnitude
            });
    }
    
    updateInputVectorFloat() {
        const state = this.framework.getState();
        
        if (state.inputVector) {
            const floatY = Math.sin(this.pulseTime * Constants.ANIMATION.FLOAT_SPEED_Y) * Constants.ANIMATION.FLOAT_AMPLITUDE_Y;
            const floatX = Math.cos(this.pulseTime * Constants.ANIMATION.FLOAT_SPEED_X) * Constants.ANIMATION.FLOAT_AMPLITUDE_X;
            
            this.svg.select(".input-vector")
                .attr("transform", `translate(${state.inputVector.x + floatX}, ${state.inputVector.y + floatY})`);
        }
    }
    
    updateForceLineAnimation() {
        const pulseTime = this.pulseTime;
        this.svg.selectAll(".force-line")
            .style("opacity", function(d) {
                const element = window.d3.select(this);
                if (element.empty()) return 0.6;
                
                const baseOpacity = parseFloat(element.attr("data-base-opacity") || 0.6);
                const pulse = Math.sin(pulseTime * Constants.ANIMATION.FORCE_PULSE_SPEED) * 0.2 + 1;
                return Math.min(1, baseOpacity * pulse);
            });
    }
    
    restart() {
        this.stop();
        setTimeout(() => this.start(), 100);
    }
}
