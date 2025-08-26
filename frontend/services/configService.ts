import { ApiConfig } from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment configuration
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// Configuration interface
export interface AppConfig {
  environment: Environment;
  api: ApiConfig;
  features: {
    enableRetry: boolean;
    enableLogging: boolean;
  };
}

// Storage keys
const STORAGE_KEYS = {
  CONFIG: 'centscape_config',
  API_CONFIG: 'centscape_api_config',
  FEATURES: 'centscape_features',
  ENVIRONMENT: 'centscape_environment',
};

// Default configurations for different environments
const CONFIGURATIONS: Record<Environment, AppConfig> = {
  [Environment.DEVELOPMENT]: {
    environment: Environment.DEVELOPMENT,
    api: {
      baseURL: 'http://localhost:3000',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    features: {
      enableRetry: true,
      enableLogging: true,
    },
  },
  [Environment.STAGING]: {
    environment: Environment.STAGING,
    api: {
      baseURL: 'https://staging-api.centscape.com',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    features: {
      enableRetry: true,
      enableLogging: true,
    },
  },
  [Environment.PRODUCTION]: {
    environment: Environment.PRODUCTION,
    api: {
      baseURL: 'https://api.centscape.com',
      timeout: 20000,
      retryAttempts: 2,
      retryDelay: 2000,
    },
    features: {
      enableRetry: true,
      enableLogging: false,
    },
  },
};

// Configuration service class
export class ConfigService {
  private static instance: ConfigService;
  private currentConfig: AppConfig;
  private isInitialized = false;

  private constructor() {
    // Default to development environment
    this.currentConfig = CONFIGURATIONS[Environment.DEVELOPMENT];
  }

  // Singleton pattern
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Initialize configuration from storage
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔧 ConfigService: Initializing configuration from storage');
      
      // Load saved configuration
      const savedConfig = await this.loadFromStorage();
      if (savedConfig) {
        this.currentConfig = savedConfig;
        console.log('✅ ConfigService: Loaded saved configuration', {
          baseURL: this.currentConfig.api.baseURL,
          environment: this.currentConfig.environment
        });
      } else {
        console.log('ℹ️ ConfigService: No saved configuration found, using defaults');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ ConfigService: Failed to initialize configuration', error);
      // Fall back to default configuration
      this.currentConfig = CONFIGURATIONS[Environment.DEVELOPMENT];
      this.isInitialized = true;
    }
  }

  // Load configuration from AsyncStorage
  private async loadFromStorage(): Promise<AppConfig | null> {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
      return null;
    } catch (error) {
      console.error('❌ ConfigService: Failed to load from storage', error);
      return null;
    }
  }

  // Save configuration to AsyncStorage
  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.currentConfig));
      console.log('💾 ConfigService: Configuration saved to storage');
    } catch (error) {
      console.error('❌ ConfigService: Failed to save to storage', error);
    }
  }

  // Get current configuration
  public getConfig(): AppConfig {
    return { ...this.currentConfig };
  }

  // Get API configuration
  public getApiConfig(): ApiConfig {
    return { ...this.currentConfig.api };
  }

  // Get feature flags
  public getFeatures() {
    return { ...this.currentConfig.features };
  }

  // Set environment
  public async setEnvironment(environment: Environment): Promise<void> {
    this.currentConfig = CONFIGURATIONS[environment];
    await this.saveToStorage();
    console.log('🔄 ConfigService: Environment set to', environment);
  }

  // Update API configuration
  public async updateApiConfig(apiConfig: Partial<ApiConfig>): Promise<void> {
    this.currentConfig.api = { ...this.currentConfig.api, ...apiConfig };
    await this.saveToStorage();
    console.log('🔧 ConfigService: API config updated', apiConfig);
  }

  // Update feature flags
  public async updateFeatures(features: Partial<AppConfig['features']>): Promise<void> {
    this.currentConfig.features = { ...this.currentConfig.features, ...features };
    await this.saveToStorage();
    console.log('⚙️ ConfigService: Features updated', features);
  }

  // Check if feature is enabled
  public isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.currentConfig.features[feature];
  }

  // Get environment
  public getEnvironment(): Environment {
    return this.currentConfig.environment;
  }

  // Check if in development mode
  public isDevelopment(): boolean {
    return this.currentConfig.environment === Environment.DEVELOPMENT;
  }

  // Check if in production mode
  public isProduction(): boolean {
    return this.currentConfig.environment === Environment.PRODUCTION;
  }

  // Reset to defaults
  public async resetToDefaults(): Promise<void> {
    this.currentConfig = CONFIGURATIONS[Environment.DEVELOPMENT];
    await this.saveToStorage();
    console.log('🔄 ConfigService: Reset to default configuration');
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();
