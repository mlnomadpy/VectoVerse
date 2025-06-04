export class FileHandler {
    constructor(framework) {
        this.framework = framework;
    }

    handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                const uploadedVectors = [];

                lines.forEach((line, index) => {
                    const components = line.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
                    if (components.length > 0) {
                        const config = this.framework.getConfig();

                        // Adjust dimensions if needed
                        if (components.length > config.dimensions) {
                            this.framework.updateConfig('dimensions', components.length);
                            d3.select("#dimensions").property("value", components.length);
                            d3.select("#dim-value").text(components.length);
                        }

                        const vector = {
                            id: index,
                            components: components,
                            x: Math.random() * (config.width - 100) + 50,
                            y: Math.random() * (config.height - 100) + 50,
                            isUploaded: true
                        };
                        uploadedVectors.push(vector);
                    }
                });

                if (uploadedVectors.length > 0) {
                    const state = this.framework.getState();
                    state.vectors = uploadedVectors;
                    this.framework.updateConfig('numVectors', uploadedVectors.length);
                    d3.select("#vectors").property("value", uploadedVectors.length);
                    d3.select("#vec-value").text(uploadedVectors.length);
                    this.framework.render();
                }
            } catch (error) {
                alert("Error reading file. Please ensure it contains one vector per line with space or comma-separated numbers.");
                console.error("File upload error:", error);
            }
        };
        reader.readAsText(file);
    }
}