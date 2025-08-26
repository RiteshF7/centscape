import { PreviewApiResponse } from '@/types/wishlist';
import { previewService } from './previewService';

// Main preview fetcher - uses the configured API service
export const fetchUrlPreview = async (url: string): Promise<PreviewApiResponse> => {
  // Validate URL
  if (!url || typeof url !== 'string') {
    return {
      success: false,
      error: 'Invalid URL provided',
    };
  }

  try {
    // Fetch from configured backend API
    const apiPreview = await previewService.fetchPreview(url);
    
    return {
      success: true,
      data: apiPreview,
    };
  } catch (apiError) {
    return {
      success: false,
      error: `API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
    };
  }
};


