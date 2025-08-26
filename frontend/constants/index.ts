// Navigation Constants
export const ROUTES = {
  INDEX: 'addURL',
  ADD: 'addProduct',
  CONFIG: 'config',
  WISHLIST: 'wishlist',
} as const;

// Screen Options Constants
export const SCREEN_OPTIONS = {
  HEADER_SHOWN: false,
} as const;

// Text Constants
export const TEXT = {
  ADD_TO_WISHLIST: 'Add to Wishlist',
  LOADING: 'Loading...',
  ERROR_LOADING_PREVIEW: 'Failed to load preview',
  ERROR_INVALID_URL: 'Invalid URL provided',
  SUCCESS_ADDED_TO_WISHLIST: 'Added to wishlist!',
  RETRY: 'Retry',
  NO_PREVIEW_AVAILABLE: 'No preview available',
  API_CONFIGURATION: 'API Configuration',
  CONFIGURE_LOCALHOST_API: 'Configure your localhost API settings',
  API_SETTINGS: 'API Settings',
  API_BASE_URL: 'API Base URL',
  ENTER_LOCALHOST_URL: 'Enter your localhost API URL (e.g., http://localhost:3000)',
  REQUEST_TIMEOUT: 'Request Timeout (ms)',
  RETRY_ATTEMPTS: 'Retry Attempts',
  ENVIRONMENT: 'Environment',
  FEATURES: 'Features',
  ENABLE_RETRY_LOGIC: 'Enable Retry Logic',
  ENABLE_LOGGING: 'Enable Logging',
  TEST_CONNECTION: 'Test Connection',
  SAVE_CONFIGURATION: 'Save Configuration',
  RESET_TO_DEFAULTS: 'Reset to Defaults',
  CONFIGURATION_SAVED: 'Configuration saved successfully!',
  CONFIGURATION_RESET: 'Configuration reset to defaults',
  API_CONNECTION_SUCCESSFUL: 'API connection successful!',
  API_URL_REQUIRED: 'API URL is required',
  TIMEOUT_MUST_BE_POSITIVE: 'Timeout must be a positive number',
  RETRY_MUST_BE_NON_NEGATIVE: 'Retry attempts must be a non-negative number',
  FAILED_TO_SAVE_CONFIG: 'Failed to save configuration',
  PLEASE_ENTER_API_URL: 'Please enter an API URL first',
  API_RESPONDED_WITH_STATUS: 'API responded with status:',
  CONNECTION_FAILED: 'Connection failed:',
  RESET_CONFIGURATION: 'Reset Configuration',
  RESET_CONFIGURATION_CONFIRM: 'Are you sure you want to reset to default settings?',
  CANCEL: 'Cancel',
  RESET: 'Reset',
  API_CONFIGURATION_BUTTON: 'API Configuration',
  APP_TITLE: 'Centscape',
  ADD_URLS_TO_WISHLIST: 'Add URLs to your wishlist',
  ENTER_URL_PLACEHOLDER: 'Enter URL (e.g., https://example.com)',
  ADD_TO_WISHLIST_BUTTON: 'Add to Wishlist',
  LOADING_PREVIEW: 'Loading preview...',
  ADD_LINK: 'Add Link',
  VIEW_WISHLIST: 'View Wishlist',
  PRODUCT_PREVIEW: 'Product Preview',
  PRODUCT_DETAILS: 'Product Details',
  SMART_SHOPPING: 'Smart Shopping, Smart Savings',
  SAVE_PRODUCTS: 'Save products to your wishlist and track prices for the best deals',
  MY_WISHLIST: 'My Wishlist',
  WISHLIST_EMPTY: 'Your wishlist is empty',
  WISHLIST_EMPTY_SUBTITLE: 'Start adding products to your wishlist to see them here',
  ADD_PRODUCTS: 'Add Products',
  WISHLIST_ITEMS: 'Wishlist Items',
  REMOVE_ITEM: 'Remove Item',
  REMOVE_ITEM_CONFIRM: 'Are you sure you want to remove this item from your wishlist?',
  CLEAR_WISHLIST: 'Clear Wishlist',
  CLEAR_WISHLIST_CONFIRM: 'Are you sure you want to clear all items from your wishlist? This action cannot be undone.',
  REMOVE: 'Remove',
  CLEAR_ALL: 'Clear All',
  SHARE: 'Share',
  SHARE_COMING_SOON: 'Share functionality will be available soon!',
} as const;

// Style Constants
export const STYLES = {
  COLORS: {
    WHITE: '#fff',
    TEXT_PRIMARY: '#333',
    TEXT_SECONDARY: '#666',
  },
  FONTS: {
    SIZE_LARGE: 24,
    WEIGHT_BOLD: 'bold' as const,
  },
  LAYOUT: {
    FLEX_FULL: 1,
    CENTER: 'center' as const,
  },
} as const;

// Deep Linking Constants
export const DEEP_LINKING = {
  SCHEME: 'centscape',
  ADD_PATH: '/add',
  URL_PARAM: 'url',
  FULL_ADD_PATH: '/add?url=',
} as const;

// API Constants
export const API = {
  PREVIEW_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Storage Constants
export const STORAGE_KEYS = {
  WISHLIST: '@centscape/wishlist',
} as const;
