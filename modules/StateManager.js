export class StateManager {
    constructor(framework) {
        this.framework = framework;
        this.state = {
            vectors: [],
            inputVector: null,
            selectedVectorId: null
        };
    }

    getVectors() {
        return this.state.vectors;
    }

    getInputVector() {
        return this.state.inputVector;
    }

    getSelectedVector() {
        if (this.state.selectedVectorId === null) return null;
        return this.state.vectors.find(v => v.id === this.state.selectedVectorId);
    }

    generateVectors() {
        this.state.vectors = [];
        const margin = 80;
        const config = this.framework.getConfig();

        for (let i = 0; i < config.numVectors; i++) {
            const vector = {
                id: i,
                components: [],
                x: Math.random() * (config.width - 2 * margin) + margin,
                y: Math.random() * (config.height - 2 * margin) + margin
            };

            for (let d = 0; d < config.dimensions; d++) {
                vector.components.push((Math.random() - 0.5) * 2);
            }

            this.state.vectors.push(vector);
        }

        this.state.selectedVectorId = null;
        this.state.inputVector = null;
        this.framework.notify('stateChanged');
    }

    selectVector(vectorId) {
        if (this.state.selectedVectorId === vectorId) {
            this.state.selectedVectorId = null; // Toggle off
        } else {
            this.state.selectedVectorId = vectorId;
        }
        this.framework.notify('stateChanged');
    }

    addInputVector() {
        const config = this.framework.getConfig();
        const inputVector = {
            id: 'input',
            components: [],
            x: Math.random() * (config.width - 100) + 50,
            y: Math.random() * (config.height - 100) + 50,
            isInput: true
        };

        for (let d = 0; d < config.dimensions; d++) {
            inputVector.components.push((Math.random() - 0.5) * 2);
        }

        this.state.inputVector = inputVector;
        this.framework.notify('stateChanged');
    }

    removeInputVector() {
        this.state.inputVector = null;
        this.framework.notify('stateChanged');
    }

    randomizeInputVector(callback) {
        if (!this.state.inputVector) return;
        for (let i = 0; i < this.state.inputVector.components.length; i++) {
            this.state.inputVector.components[i] = (Math.random() - 0.5) * 2;
        }
        this.framework.notify('stateChanged');
        if (callback) {
            callback(this.state.inputVector.components);
        }
    }

    updateInputVectorComponent(index, value) {
        if (!this.state.inputVector) return;
        this.state.inputVector.components[index] = value;
        this.framework.notify('stateChanged');
    }

    removeVector(vectorId) {
        this.state.vectors = this.state.vectors.filter(v => v.id !== vectorId);
        if (this.state.selectedVectorId === vectorId) {
            this.state.selectedVectorId = null;
        }
        this.framework.notify('stateChanged');
    }

    setVectorCustomColor(vectorId, color) {
        const vector = this.state.vectors.find(v => v.id === vectorId);
        if (vector) {
            vector.customColor = color;
            this.framework.notify('stateChanged');
        }
    }

    setVectorScale(vectorId, scale) {
        const vector = this.state.vectors.find(v => v.id === vectorId);
        if (vector) {
            vector.scale = scale;
            this.framework.notify('stateChanged');
        }
    }
} 