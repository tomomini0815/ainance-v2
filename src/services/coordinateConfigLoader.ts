/**
 * Coordinate Config Loader Service
 * 
 * This service loads PDF field coordinates from a JSON configuration file,
 * allowing coordinates to be updated without code changes.
 * 
 * Usage:
 * 1. Export coordinates from the Coordinate Picker tool (/tools/coordinate_picker.html)
 * 2. Save the JSON file to /public/configs/coordinate_config.json
 * 3. The app will automatically load the new coordinates on next page refresh
 */

export interface FieldConfig {
    id: string;
    type: 'digit' | 'text';
    x: number;
    y: number;
    label: string;
}

export interface FormConfig {
    name: string;
    pages: number;
    fields: {
        [page: string]: FieldConfig[];
    };
}

export interface CoordinateConfig {
    version: string;
    exportedAt: string;
    configs: {
        [formKey: string]: FormConfig;
    };
}

// Cache for loaded config
let cachedConfig: CoordinateConfig | null = null;

/**
 * Load coordinate configuration from JSON file
 * @returns Promise<CoordinateConfig>
 */
export async function loadCoordinateConfig(): Promise<CoordinateConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    try {
        const response = await fetch(`/configs/coordinate_config.json?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Failed to load config: ${response.status}`);
        }
        cachedConfig = await response.json();
        console.log('[CoordinateLoader] Loaded config:', cachedConfig?.version, cachedConfig?.exportedAt);
        return cachedConfig!;
    } catch (error) {
        console.warn('[CoordinateLoader] Failed to load external config, using defaults:', error);
        // Return empty config - fallback to hardcoded values in services
        return {
            version: '0.0',
            exportedAt: '',
            configs: {}
        };
    }
}

/**
 * Get field coordinates for a specific form and page
 * @param formKey - Form identifier (e.g., 'beppyo1', 'table1')
 * @param page - Page number (1-indexed)
 * @returns Array of field configurations
 */
export async function getFormFields(formKey: string, page: number = 1): Promise<FieldConfig[]> {
    const config = await loadCoordinateConfig();
    const formConfig = config.configs[formKey];

    if (!formConfig) {
        console.warn(`[CoordinateLoader] Form config not found: ${formKey}`);
        return [];
    }

    return formConfig.fields[String(page)] || [];
}

/**
 * Get digit fields only for a specific form and page
 */
export async function getDigitFields(formKey: string, page: number = 1): Promise<FieldConfig[]> {
    const fields = await getFormFields(formKey, page);
    return fields.filter(f => f.type === 'digit');
}

/**
 * Get text fields only for a specific form and page
 */
export async function getTextFields(formKey: string, page: number = 1): Promise<FieldConfig[]> {
    const fields = await getFormFields(formKey, page);
    return fields.filter(f => f.type === 'text');
}

/**
 * Clear the cached config (useful for testing or forcing reload)
 */
export function clearConfigCache(): void {
    cachedConfig = null;
}

/**
 * Get all available form keys
 */
export async function getAvailableForms(): Promise<string[]> {
    const config = await loadCoordinateConfig();
    return Object.keys(config.configs);
}
