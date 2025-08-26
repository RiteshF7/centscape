import { ApiConfig, ApiResponse, RequestOptions } from '@/types/api';
import { configService } from './configService';

// Custom error class for API errors
export class ApiClientError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

// API Client class following singleton pattern
class ApiClient {
  private config: ApiConfig;
  private abortController: AbortController | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...configService.getApiConfig(), ...config };
  }

  // Create a new request with timeout and abort controller
  private createRequest(timeout?: number): { signal: AbortSignal; timeoutId: NodeJS.Timeout } {
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeout || this.config.timeout);

    return { signal: this.abortController.signal, timeoutId };
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.config.baseURL}${cleanEndpoint}`;
  }

  // Default headers
  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt >= this.config.retryAttempts || this.shouldNotRetry(error)) {
        console.log(`🔄 Retry failed after ${attempt} attempts, giving up`);
        throw error;
      }

      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      console.log(`🔄 Retry attempt ${attempt}/${this.config.retryAttempts} after ${delay}ms delay`);
      await this.delay(delay);

      return this.retryRequest(requestFn, attempt + 1);
    }
  }

  // Determine if request should not be retried
  private shouldNotRetry(error: any): boolean {
    if (error instanceof ApiClientError) {
      // Don't retry client errors (4xx)
      return error.status && error.status >= 400 && error.status < 500;
    }
    return false;
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main request method
  private async request<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    const { signal, timeoutId } = this.createRequest(options.timeout);
    
    try {
      const url = this.buildUrl(endpoint);
      const headers = { ...this.getDefaultHeaders(), ...options.headers };

      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        signal,
        body: options.body ? JSON.stringify(options.body) : undefined,
      };

      // Log outgoing request
      console.log(`📤 [${requestId}] API Request:`, {
        method: options.method,
        url,
        endpoint,
        headers: Object.keys(headers),
        hasBody: !!options.body,
        body: options.body ? JSON.stringify(options.body, null, 2) : undefined,
        timeout: options.timeout || this.config.timeout
      });

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      // Log response headers
      console.log(`📥 [${requestId}] API Response Headers:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        duration: `${duration}ms`
      });

      if (!response.ok) {
        console.error(`❌ [${requestId}] API Error Response:`, {
          status: response.status,
          statusText: response.statusText,
          url,
          duration: `${duration}ms`
        });
        throw new ApiClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      // Log successful response
      console.log(`✅ [${requestId}] API Success Response:`, {
        data: JSON.stringify(data, null, 2),
        duration: `${duration}ms`
      });
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      console.error(`❌ [${requestId}] API Request Failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error.constructor.name,
        duration: `${duration}ms`,
        url: this.buildUrl(endpoint),
        method: options.method
      });
      
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        console.log(`⏰ [${requestId}] Request timed out after ${duration}ms`);
        throw new ApiClientError('Request timeout', 408, 'TIMEOUT');
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Public methods for different HTTP verbs
  public async get<T>(endpoint: string, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    console.log(`🔍 GET Request: ${endpoint}`);
    return this.retryRequest(() => 
      this.request<T>(endpoint, { method: 'GET', ...options })
    );
  }

  public async post<T>(
    endpoint: string, 
    body: any, 
    options?: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    console.log(`📝 POST Request: ${endpoint}`, { body });
    return this.retryRequest(() => 
      this.request<T>(endpoint, { method: 'POST', body, ...options })
    );
  }

  public async put<T>(
    endpoint: string, 
    body: any, 
    options?: Partial<RequestOptions>
  ): Promise<ApiResponse<T>> {
    console.log(`✏️ PUT Request: ${endpoint}`, { body });
    return this.retryRequest(() => 
      this.request<T>(endpoint, { method: 'PUT', body, ...options })
    );
  }

  public async delete<T>(endpoint: string, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    console.log(`🗑️ DELETE Request: ${endpoint}`);
    return this.retryRequest(() => 
      this.request<T>(endpoint, { method: 'DELETE', ...options })
    );
  }

  // Update configuration
  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  public getConfig(): ApiConfig {
    return this.config;
  }

  // Abort current request
  public abort(): void {
    this.abortController?.abort();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
