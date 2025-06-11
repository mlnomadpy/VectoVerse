export class FileHandler {
    constructor(framework) {
        this.framework = framework;
        this.ui = null;
        this.maxDimensions = 10000; // Support up to 10k dimensions
        this.maxFileSize = 100 * 1024 * 1024; // 100MB limit
    }

    handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > this.maxFileSize) {
            this.showError(`File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`);
            return;
        }

        // Show loading indicator
        this.showProgress('Reading file...', 0);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.processFileContent(e.target.result, file.name);
            } catch (error) {
                console.error("File upload error:", error);
                this.showError(`Error processing file: ${error.message}`);
            }
        };

        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    }

    processFileContent(content, filename) {
        const extension = filename.toLowerCase().split('.').pop();
        let vectors;

        this.showProgress('Parsing content...', 20);

        try {
            switch (extension) {
                case 'json':
                    vectors = this.parseJSON(content);
                    break;
                case 'csv':
                    vectors = this.parseCSV(content);
                    break;
                case 'txt':
                    vectors = this.parseTXT(content);
                    break;
                default:
                    // Try to auto-detect format
                    vectors = this.autoDetectFormat(content);
                    break;
            }

            if (!vectors || vectors.length === 0) {
                throw new Error('No valid vectors found in file');
            }

            this.showProgress('Processing vectors...', 60);
            this.loadVectors(vectors);

        } catch (error) {
            throw new Error(`Failed to parse ${extension.toUpperCase()} file: ${error.message}`);
        }
    }

    parseJSON(content) {
        const data = JSON.parse(content);
        
        // Handle different JSON structures
        if (Array.isArray(data)) {
            // Direct array of vectors
            return data;
        } else if (data.vectors && Array.isArray(data.vectors)) {
            // Object with vectors property
            return data.vectors;
        } else if (data.data && Array.isArray(data.data)) {
            // Object with data property
            return data.data;
        } else if (data.matrix && Array.isArray(data.matrix)) {
            // Object with matrix property
            return data.matrix;
        }
        
        throw new Error('JSON must contain an array of vectors or an object with "vectors", "data", or "matrix" property');
    }

    parseCSV(content) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        const vectors = [];
        
        // Check if first line might be headers (contains non-numeric data)
        const firstLine = lines[0].split(',').map(cell => cell.trim());
        const hasHeaders = firstLine.some(cell => isNaN(parseFloat(cell)));
        const startIndex = hasHeaders ? 1 : 0;

        if (lines.length <= startIndex) {
            throw new Error('CSV file appears to contain only headers or is empty');
        }

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const components = line.split(',')
                .map(val => parseFloat(val.trim()))
                .filter(num => !isNaN(num));

            if (components.length > 0) {
                vectors.push(components);
            }
        }

        return vectors;
    }

    parseTXT(content) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        const vectors = [];

        for (const line of lines) {
            const components = line.split(/\s+/)
                .map(val => parseFloat(val.trim()))
                .filter(num => !isNaN(num));

            if (components.length > 0) {
                vectors.push(components);
            }
        }

        return vectors;
    }

    autoDetectFormat(content) {
        // Try JSON first
        try {
            return this.parseJSON(content);
        } catch (e) {
            // Not JSON, try CSV
            try {
                return this.parseCSV(content);
            } catch (e) {
                // Not CSV, try TXT
                return this.parseTXT(content);
            }
        }
    }

    loadVectors(vectorData) {
        this.showProgress('Validating vectors...', 80);

        // Validate vectors have consistent dimensions
        if (vectorData.length === 0) {
            throw new Error('No vectors found in file');
        }

        const dimensions = vectorData[0].length;
        if (dimensions === 0) {
            throw new Error('Vectors cannot be empty');
        }

        if (dimensions > this.maxDimensions) {
            throw new Error(`Too many dimensions (${dimensions}). Maximum supported: ${this.maxDimensions}`);
        }

        // Check all vectors have same dimensions
        for (let i = 1; i < vectorData.length; i++) {
            if (vectorData[i].length !== dimensions) {
                throw new Error(`Inconsistent dimensions: Vector ${i + 1} has ${vectorData[i].length} dimensions, expected ${dimensions}`);
            }
        }

        this.showProgress('Creating visualization...', 90);

        // Update framework configuration
        const config = this.framework.getConfig();
        this.framework.updateConfig('dimensions', dimensions);
        this.framework.updateConfig('numVectors', vectorData.length);

        // Update UI controls
        const dimSlider = document.getElementById('dimensions');
        const vecSlider = document.getElementById('vectors');
        
        if (dimSlider) {
            dimSlider.max = Math.max(dimensions, 20);
            dimSlider.value = dimensions;
            document.getElementById('dim-value').textContent = `${dimensions}D`;
        }
        
        if (vecSlider) {
            vecSlider.max = Math.max(vectorData.length, 12);
            vecSlider.value = vectorData.length;
            document.getElementById('vec-value').textContent = vectorData.length;
        }

        // Create vector objects
        const uploadedVectors = vectorData.map((components, index) => ({
            id: index,
            components: components,
            x: Math.random() * (config.width - 100) + 50,
            y: Math.random() * (config.height - 100) + 50,
            isUploaded: true,
            uploadedAt: Date.now()
        }));

        // Update state
        const state = this.framework.getState();
        state.vectors = uploadedVectors;
        
        // Render the visualization
        this.framework.render();

        this.hideProgress();
        this.showSuccess(
            `Successfully loaded ${vectorData.length} vectors with ${dimensions} dimensions`,
            `File contained ${vectorData.length} vectors in ${dimensions}D space`
        );
    }

    showProgress(message, percentage) {
        if (this.ui && typeof this.ui.showProgress === 'function') {
            this.ui.showProgress(message, percentage);
        } else {
            // Fallback for basic progress indication
            console.log(`Progress: ${percentage}% - ${message}`);
        }
    }

    hideProgress() {
        if (this.ui && typeof this.ui.hideProgress === 'function') {
            this.ui.hideProgress();
        }
    }

    showSuccess(title, details) {
        if (this.ui && typeof this.ui.showToast === 'function') {
            this.ui.showToast(title, 'success');
            if (details) {
                console.log(details);
            }
        } else {
            alert(title);
        }
    }

    showError(message) {
        if (this.ui && typeof this.ui.showToast === 'function') {
            this.ui.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    exportStateToJson() {
        const state = this.framework.getState();
        const data = {
            config: this.framework.getConfig(),
            vectors: state.vectors.map(v => ({
                id: v.id,
                components: v.components,
                isUploaded: v.isUploaded,
                isInput: v.isInput
            })),
            inputVector: state.inputVector ? {
                id: state.inputVector.id,
                components: state.inputVector.components,
                isInput: true
            } : null
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "vectoverse_state.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        if (this.ui && typeof this.ui.showToast === 'function') {
            this.ui.showToast('State exported successfully!', 'success');
        } else {
            alert('State exported successfully!');
        }
    }
}