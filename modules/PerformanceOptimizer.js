// Performance Optimizer for VectoVerse
export class PerformanceOptimizer {
    constructor(framework) {
        this.framework = framework;
        this.frameRate = 60;
        this.renderQueue = [];
        this.isRendering = false;
        this.performanceMetrics = {
            fps: 0,
            renderTime: 0,
            memoryUsage: 0,
            vectorCount: 0
        };
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate
        let lastTime = performance.now();
        let frameCount = 0;
        
        const trackFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust rendering quality based on FPS
                this.adjustRenderingQuality();
            }
            
            requestAnimationFrame(trackFPS);
        };
        
        requestAnimationFrame(trackFPS);

        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.performanceMetrics.memoryUsage = Math.round(
                    performance.memory.usedJSHeapSize / 1024 / 1024
                );
            }, 5000);
        }
    }

    adjustRenderingQuality() {
        const config = this.framework.getConfig();
        const state = this.framework.getState();
        
        // Reduce quality for low FPS
        if (this.performanceMetrics.fps < 30) {
            this.optimizeForLowPerformance();
        } else if (this.performanceMetrics.fps > 50) {
            this.restoreHighQuality();
        }
        
        // Limit vector count for performance
        if (state.vectors.length > 100 && this.performanceMetrics.fps < 15) {
            this.framework.uiController.showToast(
                'Performance warning: Too many vectors. Consider reducing the count.',
                'warning'
            );
        }
    }

    optimizeForLowPerformance() {
        const svg = document.querySelector('#main-viz');
        if (svg) {
            svg.style.shapeRendering = 'optimizeSpeed';
            svg.style.textRendering = 'optimizeSpeed';
        }

        // Reduce animation frequency
        this.frameRate = 30;
        
        // Disable expensive visual effects
        document.querySelectorAll('.vector-atom').forEach(atom => {
            atom.style.filter = 'none';
        });
    }

    restoreHighQuality() {
        const svg = document.querySelector('#main-viz');
        if (svg) {
            svg.style.shapeRendering = 'auto';
            svg.style.textRendering = 'auto';
        }

        this.frameRate = 60;
        
        // Re-enable visual effects
        document.querySelectorAll('.vector-atom').forEach(atom => {
            atom.style.filter = '';
        });
    }

    throttleRender(renderFunction, delay = 16) {
        let lastRender = 0;
        
        return (...args) => {
            const now = performance.now();
            
            if (now - lastRender >= delay) {
                lastRender = now;
                return renderFunction(...args);
            }
        };
    }

    debounceRender(renderFunction, delay = 100) {
        let timeoutId;
        
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => renderFunction(...args), delay);
        };
    }

    batchRenderUpdates(updates) {
        this.renderQueue.push(...updates);
        
        if (!this.isRendering) {
            this.isRendering = true;
            requestAnimationFrame(() => this.processRenderQueue());
        }
    }

    processRenderQueue() {
        const startTime = performance.now();
        
        // Process updates in batches
        const batchSize = 10;
        const batch = this.renderQueue.splice(0, batchSize);
        
        batch.forEach(update => {
            try {
                update();
            } catch (error) {
                this.framework.errorHandler.handleError(error, {
                    context: 'Render Queue Processing'
                });
            }
        });
        
        // Continue processing if queue is not empty
        if (this.renderQueue.length > 0) {
            requestAnimationFrame(() => this.processRenderQueue());
        } else {
            this.isRendering = false;
        }
        
        this.performanceMetrics.renderTime = performance.now() - startTime;
    }

    optimizeVectorRendering(vectors) {
        // Use level-of-detail rendering for many vectors
        if (vectors.length > 50) {
            return this.applyLevelOfDetail(vectors);
        }
        
        return vectors;
    }

    applyLevelOfDetail(vectors) {
        const config = this.framework.getConfig();
        const viewBox = this.getViewBox();
        
        return vectors.map(vector => {
            const distance = this.getDistanceFromCenter(vector, viewBox);
            const shouldSimplify = distance > viewBox.width * 0.4;
            
            return {
                ...vector,
                simplified: shouldSimplify,
                renderDetail: shouldSimplify ? 'low' : 'high'
            };
        });
    }

    getViewBox() {
        const config = this.framework.getConfig();
        return {
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            centerX: config.width / 2,
            centerY: config.height / 2
        };
    }

    getDistanceFromCenter(vector, viewBox) {
        const dx = vector.x - viewBox.centerX;
        const dy = vector.y - viewBox.centerY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    manageMemory() {
        // Clean up unused DOM elements
        this.cleanupDOMElements();
        
        // Clear old data from caches
        this.clearCaches();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    cleanupDOMElements() {
        // Remove orphaned tooltips
        document.querySelectorAll('.vector-tooltip').forEach(tooltip => {
            if (!tooltip.style.display || tooltip.style.display === 'none') {
                tooltip.remove();
            }
        });
        
        // Remove old error notifications
        const errorNotifications = document.querySelectorAll('.error-notification');
        if (errorNotifications.length > 3) {
            errorNotifications[0].remove();
        }
        
        // Clean up modal overlays
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            if (!modal.parentNode) {
                modal.remove();
            }
        });
    }

    clearCaches() {
        // Clear analysis result caches
        if (this.framework.modules.analysisEngine) {
            this.framework.modules.analysisEngine.clearCache?.();
        }
        
        // Clear force calculation cache
        if (this.framework.modules.forceCalculator) {
            this.framework.modules.forceCalculator.clearCache?.();
        }
    }

    shouldReduceComplexity() {
        const state = this.framework.getState();
        const isMobile = window.innerWidth < 768;
        const isLowMemory = this.performanceMetrics.memoryUsage > 50; // MB
        const isLowFPS = this.performanceMetrics.fps < 20;
        const tooManyVectors = state.vectors.length > (isMobile ? 30 : 100);
        
        return isMobile || isLowMemory || isLowFPS || tooManyVectors;
    }

    getOptimizedConfig() {
        const baseConfig = this.framework.getConfig();
        
        if (this.shouldReduceComplexity()) {
            return {
                ...baseConfig,
                numVectors: Math.min(baseConfig.numVectors, 20),
                dimensions: Math.min(baseConfig.dimensions, 5),
                showForces: false,
                animationSpeed: 0.5
            };
        }
        
        return baseConfig;
    }

    getPerformanceReport() {
        const state = this.framework.getState();
        
        return {
            metrics: this.performanceMetrics,
            recommendations: this.getPerformanceRecommendations(),
            systemInfo: {
                isMobile: window.innerWidth < 768,
                devicePixelRatio: window.devicePixelRatio || 1,
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
                memory: navigator.deviceMemory || 'unknown'
            },
            currentLoad: {
                vectors: state.vectors.length,
                dimensions: this.framework.getConfig().dimensions,
                renderQueueSize: this.renderQueue.length
            }
        };
    }

    getPerformanceRecommendations() {
        const recommendations = [];
        const state = this.framework.getState();
        
        if (this.performanceMetrics.fps < 30) {
            recommendations.push('Reduce the number of vectors for better performance');
        }
        
        if (this.performanceMetrics.memoryUsage > 100) {
            recommendations.push('Consider reducing dimensions or clearing old data');
        }
        
        if (state.vectors.length > 50) {
            recommendations.push('Large datasets may impact performance on mobile devices');
        }
        
        if (this.renderQueue.length > 20) {
            recommendations.push('Consider reducing animation frequency');
        }
        
        return recommendations;
    }

    // Utility methods for other modules
    wrapWithPerformanceCheck(fn, name) {
        return (...args) => {
            const start = performance.now();
            const result = fn(...args);
            const duration = performance.now() - start;
            
            if (duration > 16) { // Longer than one frame
                console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
            }
            
            return result;
        };
    }

    createAnimationFrame(callback) {
        const frameCallback = (timestamp) => {
            if (this.performanceMetrics.fps > 15) {
                callback(timestamp);
            }
        };
        
        return requestAnimationFrame(frameCallback);
    }
} 