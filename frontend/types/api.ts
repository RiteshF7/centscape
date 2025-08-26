// API Request Types
export interface PreviewRequest {
  url?: string;
  raw_html?: string;
}

// API Response Types
export interface PreviewResponse {
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
  sourceUrl: string;
}

// API Client Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Request Options
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
