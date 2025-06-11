/**
 * ThreeJSVisualization.js
 * Advanced 3D visualization engine for VectoVerse using Three.js
 * Provides immersive 3D rendering of vector spaces, clusters, and analysis results
 */

import * as THREE from 'three';

export class ThreeJSVisualization {
    constructor(container, framework) {
        this.container = container;
        this.framework = framework;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.vectorPoints = [];
        this.clusterGroups = [];
        this.animationId = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedVector = null;
        this.hoverVector = null;
        
        // Visualization settings
        this.settings = {
            pointSize: 0.05,
            pointColor: 0x4CAF50,
            selectedColor: 0xFF5722,
            hoverColor: 0x2196F3,
            clusterColors: [
                0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFEDA77,
                0xF38BA8, 0xA8E6CF, 0x88D8B0, 0xFFB3BA, 0xBAE1FF
            ],
            showAxes: true,
            showGrid: true,
            autoRotate: false,
            backgroundColor: 0x1a1a1a
        };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLighting();
        this.createAxesAndGrid();
        this.setupEventListeners();
        this.animate();
        
        // Subscribe to framework events
        this.framework.eventBus.on('vectorsUpdated', this.onVectorsUpdated.bind(this));
        this.framework.eventBus.on('analysisCompleted', this.onAnalysisCompleted.bind(this));
        this.framework.eventBus.on('vectorSelected', this.onVectorSelected.bind(this));
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
        this.scene.fog = new THREE.Fog(this.settings.backgroundColor, 10, 50);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createControls() {
        // Note: This requires OrbitControls to be imported separately
        // For now, we'll implement basic mouse controls
        this.setupMouseControls();
    }
    
    setupMouseControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.x,
                    y: event.clientY - previousMousePosition.y
                };
                
                const deltaRotationQuaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        toRadians(deltaMove.y * 1),
                        toRadians(deltaMove.x * 1),
                        0,
                        'XYZ'
                    ));
                
                this.camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.camera.quaternion);
                previousMousePosition = { x: event.clientX, y: event.clientY };
            } else {
                // Handle hover detection
                this.updateMousePosition(event);
                this.detectHover();
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.renderer.domElement.addEventListener('wheel', (event) => {
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });
        
        this.renderer.domElement.addEventListener('click', (event) => {
            this.updateMousePosition(event);
            this.handleClick();
        });
        
        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }
    }
    
    createLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light for shadows and highlights
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for dynamic lighting
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    createAxesAndGrid() {
        if (this.settings.showAxes) {
            const axesHelper = new THREE.AxesHelper(5);
            this.scene.add(axesHelper);
        }
        
        if (this.settings.showGrid) {
            const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
            this.scene.add(gridHelper);
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    detectHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.vectorPoints);
        
        // Reset previous hover
        if (this.hoverVector) {
            this.hoverVector.material.color.setHex(this.hoverVector.userData.originalColor);
            this.hoverVector = null;
        }
        
        if (intersects.length > 0) {
            this.hoverVector = intersects[0].object;
            if (!this.hoverVector.userData.isSelected) {
                this.hoverVector.material.color.setHex(this.settings.hoverColor);
            }
            this.updateTooltip(this.hoverVector.userData.vector);
        } else {
            this.hideTooltip();
        }
    }
    
    handleClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.vectorPoints);
        
        // Reset previous selection
        if (this.selectedVector) {
            this.selectedVector.material.color.setHex(this.selectedVector.userData.originalColor);
            this.selectedVector.userData.isSelected = false;
        }
        
        if (intersects.length > 0) {
            this.selectedVector = intersects[0].object;
            this.selectedVector.material.color.setHex(this.settings.selectedColor);
            this.selectedVector.userData.isSelected = true;
            
            // Emit selection event
            this.framework.eventBus.emit('vector3DSelected', {
                vector: this.selectedVector.userData.vector,
                index: this.selectedVector.userData.index
            });
        }
    }
    
    updateTooltip(vector) {
        // Create or update tooltip
        let tooltip = document.getElementById('vector-tooltip-3d');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'vector-tooltip-3d';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                max-width: 200px;
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <strong>Vector ${vector.id}</strong><br>
            Components: [${vector.components.map(c => c.toFixed(3)).join(', ')}]<br>
            Magnitude: ${vector.magnitude.toFixed(3)}
        `;
        
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY - 10) + 'px';
        tooltip.style.display = 'block';
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('vector-tooltip-3d');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    onVectorsUpdated(vectors) {
        this.clearVectors();
        this.renderVectors(vectors);
    }
    
    onAnalysisCompleted(result) {
        switch (result.type) {
            case 'pca':
                this.visualizePCA(result);
                break;
            case 'kmeans':
                this.visualizeClusters(result);
                break;
            case 'tsne':
                this.visualizeTSNE(result);
                break;
            case 'hierarchical':
                this.visualizeHierarchical(result);
                break;
        }
    }
    
    onVectorSelected(data) {
        // Highlight selected vector in 3D space
        this.highlightVector(data.index);
    }
    
    clearVectors() {
        this.vectorPoints.forEach(point => {
            this.scene.remove(point);
            point.geometry.dispose();
            point.material.dispose();
        });
        this.vectorPoints = [];
        
        this.clearClusters();
    }
    
    clearClusters() {
        this.clusterGroups.forEach(group => {
            this.scene.remove(group);
        });
        this.clusterGroups = [];
    }
    
    renderVectors(vectors) {
        vectors.forEach((vector, index) => {
            const geometry = new THREE.SphereGeometry(this.settings.pointSize, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: this.settings.pointColor,
                transparent: true,
                opacity: 0.8
            });
            
            const point = new THREE.Mesh(geometry, material);
            
            // Position based on vector components (use first 3 dimensions)
            const position = this.vectorToPosition(vector);
            point.position.set(position.x, position.y, position.z);
            
            // Store vector data
            point.userData = {
                vector: vector,
                index: index,
                originalColor: this.settings.pointColor,
                isSelected: false
            };
            
            point.castShadow = true;
            point.receiveShadow = true;
            
            this.scene.add(point);
            this.vectorPoints.push(point);
        });
    }
    
    vectorToPosition(vector) {
        // Convert vector components to 3D position
        // For high-dimensional vectors, use first 3 components or apply dimensionality reduction
        const components = vector.components;
        const scale = 2; // Scale factor for better visualization
        
        return {
            x: (components[0] || 0) * scale,
            y: (components[1] || 0) * scale,
            z: (components[2] || 0) * scale
        };
    }
    
    visualizePCA(result) {
        if (!result.data) return;
        // Update vector positions to PCA space
        result.data.forEach((coords, i) => {
            if (i < this.vectorPoints.length) {
                this.vectorPoints[i].position.set(
                    coords[0] * 2,
                    coords[1] * 2,
                    (coords[2] || 0) * 2
                );
            }
        });
        // Optionally, add axes or variance visualization
    }
    
    visualizeClusters(result) {
        if (!result.data || !result.data.assignments) return;
        const colors = this.settings.clusterColors;
        result.data.assignments.forEach((clusterIndex, i) => {
            if (i < this.vectorPoints.length) {
                const color = colors[clusterIndex % colors.length];
                this.vectorPoints[i].material.color.setHex(color);
                this.vectorPoints[i].userData.originalColor = color;
            }
        });
        // Optionally, visualize centroids
    }
    
    visualizeTSNE(result) {
        if (!result.data) return;
        result.data.forEach((embedding, i) => {
            if (i < this.vectorPoints.length) {
                this.vectorPoints[i].position.set(
                    embedding[0] * 2,
                    embedding[1] * 2,
                    (embedding[2] || 0) * 2
                );
            }
        });
    }
    
    visualizeHierarchical(result) {
        // Implementation of hierarchical visualization
    }
    
    highlightVector(index) {
        if (index < this.vectorPoints.length) {
            // Reset previous selection
            if (this.selectedVector) {
                this.selectedVector.material.color.setHex(this.selectedVector.userData.originalColor);
                this.selectedVector.userData.isSelected = false;
            }
            
            // Highlight new selection
            this.selectedVector = this.vectorPoints[index];
            this.selectedVector.material.color.setHex(this.settings.selectedColor);
            this.selectedVector.userData.isSelected = true;
            
            // Animate camera to focus on selected vector
            this.focusOnVector(this.selectedVector.position);
        }
    }
    
    focusOnVector(position) {
        // Smooth camera animation to focus on the selected vector
        const targetPosition = position.clone().add(new THREE.Vector3(2, 2, 2));
        
        // Simple animation - in practice, you'd use a tweening library
        const startPosition = this.camera.position.clone();
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, progress);
            this.camera.lookAt(position);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // Auto-rotation if enabled
        if (this.settings.autoRotate) {
            this.scene.rotation.y += 0.005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Apply settings changes
        if (newSettings.backgroundColor !== undefined) {
            this.scene.background.setHex(newSettings.backgroundColor);
            this.scene.fog.color.setHex(newSettings.backgroundColor);
        }
        
        if (newSettings.pointSize !== undefined) {
            this.vectorPoints.forEach(point => {
                point.scale.setScalar(newSettings.pointSize / this.settings.pointSize);
            });
        }
        
        if (newSettings.pointColor !== undefined) {
            this.vectorPoints.forEach(point => {
                if (!point.userData.isSelected) {
                    point.material.color.setHex(newSettings.pointColor);
                    point.userData.originalColor = newSettings.pointColor;
                }
            });
        }
    }
    
    exportScene() {
        // Export current 3D scene configuration
        return {
            cameraPosition: this.camera.position.toArray(),
            cameraRotation: this.camera.rotation.toArray(),
            settings: { ...this.settings },
            vectorCount: this.vectorPoints.length,
            clusterCount: this.clusterGroups.length
        };
    }
    
    importScene(sceneData) {
        // Import and apply 3D scene configuration
        if (sceneData.cameraPosition) {
            this.camera.position.fromArray(sceneData.cameraPosition);
        }
        if (sceneData.cameraRotation) {
            this.camera.rotation.fromArray(sceneData.cameraRotation);
        }
        if (sceneData.settings) {
            this.updateSettings(sceneData.settings);
        }
    }
    
    dispose() {
        // Clean up resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.clearVectors();
        this.clearClusters();
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        // Remove tooltip
        const tooltip = document.getElementById('vector-tooltip-3d');
        if (tooltip) {
            tooltip.remove();
        }
        
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
}

export default ThreeJSVisualization;
