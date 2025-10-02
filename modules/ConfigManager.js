/**
 * ConfigManager - Manages application configuration settings
 * Provides a centralized store for configuration with update capabilities
 */
export class ConfigManager {
    /**
     * Initialize ConfigManager with default configuration
     */
    constructor() {
        this.config = {
            width: 800,
            height: 600,
            dimensions: 4,
            numVectors: 6,
            showForces: false
        };
    }

    /**
     * Get the current configuration object
     * @returns {Object} Current configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Update a configuration value
     * @param {string} key - Configuration key to update
     * @param {*} value - New value for the configuration key
     */
    updateConfig(key, value) {
        this.config[key] = value;
    }
} 