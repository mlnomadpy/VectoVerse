export class ConfigManager {
    constructor() {
        this.config = {
            width: 800,
            height: 600,
            dimensions: 4,
            numVectors: 6,
            showForces: false
        };
    }

    getConfig() {
        return this.config;
    }

    updateConfig(key, value) {
        this.config[key] = value;
    }
} 