import { PreviewRequest, PreviewResponse } from '@/types/api';
import { UrlPreview } from '@/types/wishlist';
import { apiClient, ApiClientError } from './apiClient';

// Preview service class
export class PreviewService {
  private static instance: PreviewService;
  private endpoint = '/preview';

  private constructor() {}

  // Singleton pattern
  public static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }

  // Fetch URL preview from API
  public async fetchPreview(url: string, rawHtml?: string): Promise<UrlPreview> {
    console.log('🔍 PreviewService: Starting preview fetch', { url, hasRawHtml: !!rawHtml });
    
    // Validate that we're not trying to process a deep link URL
    if (url && url.startsWith('centscape://')) {
      console.error('❌ PreviewService: Attempted to process deep link URL', { url });
      throw new Error('Cannot process deep link URLs. Please extract the actual product URL first.');
    }
    
    try {
      // Only include fields that have actual values
      const requestBody: PreviewRequest = {};
      
      if (url) {
        requestBody.url = url;
      }
      
      if (rawHtml) {
        requestBody.raw_html = rawHtml;
      }

      console.log('📤 PreviewService: Sending request', { endpoint: this.endpoint, requestBody });

      const response = await apiClient.post<PreviewResponse>(this.endpoint, requestBody);

      console.log('📥 PreviewService: Received response', { 
        success: response.success, 
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (!response.success || !response.data) {
        console.error('❌ PreviewService: Invalid response from API');
        throw new ApiClientError('Invalid response from preview API');
      }

      // Transform API response to our internal format
      const transformed = this.transformApiResponse(response.data, url);
      console.log('✅ PreviewService: Successfully transformed response', {
        title: transformed.title,
        hasImage: !!transformed.image,
        hasDescription: !!transformed.description,
        hasPrice: !!transformed.price,
        price: transformed.price,
        url: transformed.url
      });

      return transformed;
    } catch (error) {
      console.error('❌ PreviewService: Error during preview fetch', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error.constructor.name,
        url
      });

      // Enhanced error handling with specific error types
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Handle network or other errors
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to fetch preview',
        0,
        'PREVIEW_FETCH_ERROR'
      );
    }
  }

  // Transform API response to internal format
  private transformApiResponse(apiResponse: PreviewResponse, originalUrl: string): UrlPreview {
    return {
      title: apiResponse.title || 'No title available',
      description: this.generateDescription(apiResponse),
      image: apiResponse.image || undefined,
      price: apiResponse.price || undefined,
      url: apiResponse.sourceUrl || originalUrl,
    };
  }

  // Generate description from available data
  private generateDescription(apiResponse: PreviewResponse): string | undefined {
    const parts: string[] = [];

    if (apiResponse.siteName) {
      parts.push(`Site: ${apiResponse.siteName}`);
    }

    if (apiResponse.price && apiResponse.currency) {
      parts.push(`Price: ${apiResponse.currency}${apiResponse.price}`);
    } else if (apiResponse.price) {
      parts.push(`Price: ${apiResponse.price}`);
    }

    if (parts.length > 0) {
      return parts.join(' • ');
    }

    return undefined;
  }

  // Update API endpoint (useful for testing or different environments)
  public setEndpoint(endpoint: string): void {
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // Get current endpoint
  public getEndpoint(): string {
    return this.endpoint;
  }
}

// Export singleton instance
export const previewService = PreviewService.getInstance();
