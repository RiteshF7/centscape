import { API } from '@/constants';
import { fetchUrlPreview } from '@/services/previewApi';
import { UrlPreview, UseUrlPreviewReturn } from '@/types/wishlist';
import { useCallback, useEffect, useState } from 'react';

export const useUrlPreview = (url: string | null): UseUrlPreviewReturn => {
  const [preview, setPreview] = useState<UrlPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRetryCount] = useState<number>(0);

  const fetchPreview = useCallback(async (targetUrl: string, attempt: number = 0) => {
    console.log('🎣 useUrlPreview: Starting preview fetch', { url: targetUrl, attempt });
    
    if (!targetUrl.trim()) {
      console.log('❌ useUrlPreview: Empty URL provided');
      setError('URL is required');
      setLoading(false);
      return;
    }

    // Validate that we're not trying to process a deep link URL
    if (targetUrl.startsWith('centscape://')) {
      console.error('❌ useUrlPreview: Attempted to process deep link URL', { targetUrl });
      setError('Invalid URL: Deep link URLs cannot be processed. Please use the actual product URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📤 useUrlPreview: Calling fetchUrlPreview', { url: targetUrl, attempt });
      const response = await fetchUrlPreview(targetUrl);
      
      console.log('📥 useUrlPreview: Received response', { 
        success: response.success, 
        hasData: !!response.data,
        error: response.error 
      });
      
      if (response.success && response.data) {
        console.log('✅ useUrlPreview: Successfully fetched preview', {
          title: response.data.title,
          hasImage: !!response.data.image,
          url: response.data.url
        });
        setPreview(response.data);
        setError(null);
        setRetryCount(0);
      } else {
        const errorMessage = response.error || 'Failed to fetch preview';
        console.error('❌ useUrlPreview: API returned error', { errorMessage, attempt });
        
        // Retry logic
        if (attempt < API.RETRY_ATTEMPTS - 1) {
          const retryDelay = 1000 * (attempt + 1);
          console.log(`🔄 useUrlPreview: Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${API.RETRY_ATTEMPTS})`);
          setTimeout(() => {
            fetchPreview(targetUrl, attempt + 1);
          }, retryDelay);
          return;
        }
        
        console.error('❌ useUrlPreview: Max retries reached, giving up');
        setError(errorMessage);
        setPreview(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      console.error('❌ useUrlPreview: Exception occurred', { 
        error: errorMessage, 
        errorType: err.constructor.name,
        attempt 
      });
      
      // Retry logic for network errors
      if (attempt < API.RETRY_ATTEMPTS - 1) {
        const retryDelay = 1000 * (attempt + 1);
        console.log(`🔄 useUrlPreview: Retrying network error in ${retryDelay}ms (attempt ${attempt + 1}/${API.RETRY_ATTEMPTS})`);
        setTimeout(() => {
          fetchPreview(targetUrl, attempt + 1);
        }, retryDelay);
        return;
      }
      
      console.error('❌ useUrlPreview: Max retries reached for network error');
      setError(errorMessage);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (url) {
      console.log('🔄 useUrlPreview: Manual retry triggered', { url });
      setRetryCount(prev => prev + 1);
      fetchPreview(url);
    } else {
      console.log('❌ useUrlPreview: Cannot retry - no URL provided');
    }
  }, [url, fetchPreview]);

  useEffect(() => {
    console.log('🔄 useUrlPreview: URL changed', { url, hasUrl: !!url });
    
    if (url) {
      setPreview(null);
      setError(null);
      fetchPreview(url);
    } else {
      console.log('🧹 useUrlPreview: Clearing state - no URL provided');
      setPreview(null);
      setError(null);
      setLoading(false);
    }
  }, [url, fetchPreview]);

  return {
    preview,
    loading,
    error,
    retry,
  };
};
