export interface NormalizedUrl {
  original: string;
  normalized: string;
  cleaned: boolean;
  productId?: string;
  hostname: string;
}

export class UrlNormalizer {
  private static readonly TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'ref', 'source', 'campaign', 'medium', 'fbclid', 'gclid',
    'msclkid', 'mc_cid', 'mc_eid', 'mc_tc', 'mc_rid'
  ];

  static normalize(urlString: string): NormalizedUrl {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname;
      
      // E-commerce specific normalization
      if (hostname.includes('amazon')) {
        return this.normalizeAmazon(url);
      } else if (hostname.includes('flipkart')) {
        return this.normalizeFlipkart(url);
      } else if (hostname.includes('myntra')) {
        return this.normalizeMyntra(url);
      }
      
      // Generic tracking parameter removal
      return this.removeTrackingParams(url);
      
    } catch (error) {
      // Return original if parsing fails
      return {
        original: urlString,
        normalized: urlString,
        cleaned: false,
        hostname: 'unknown'
      };
    }
  }

  private static normalizeAmazon(url: URL): NormalizedUrl {
    const productIdMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})/);
    
    if (productIdMatch) {
      const cleanUrl = new URL(url.origin + '/dp/' + productIdMatch[1]);
      return {
        original: url.toString(),
        normalized: cleanUrl.toString(),
        cleaned: true,
        productId: productIdMatch[1],
        hostname: url.hostname
      };
    }
    
    return this.removeTrackingParams(url);
  }

  private static normalizeFlipkart(url: URL): NormalizedUrl {
    const productIdMatch = url.pathname.match(/\/p\/([a-zA-Z0-9]+)/);
    
    if (productIdMatch) {
      const cleanUrl = new URL(url.origin + '/p/' + productIdMatch[1]);
      return {
        original: url.toString(),
        normalized: cleanUrl.toString(),
        cleaned: true,
        productId: productIdMatch[1],
        hostname: url.hostname
      };
    }
    
    return this.removeTrackingParams(url);
  }

  private static normalizeMyntra(url: URL): NormalizedUrl {
    const productIdMatch = url.pathname.match(/\/product\/([a-zA-Z0-9-]+)/);
    
    if (productIdMatch) {
      const cleanUrl = new URL(url.origin + '/product/' + productIdMatch[1]);
      return {
        original: url.toString(),
        normalized: cleanUrl.toString(),
        cleaned: true,
        productId: productIdMatch[1],
        hostname: url.hostname
      };
    }
    
    return this.removeTrackingParams(url);
  }

  private static removeTrackingParams(url: URL): NormalizedUrl {
    const cleanParams = new URLSearchParams();
    
    for (const [key, value] of url.searchParams.entries()) {
      if (!this.TRACKING_PARAMS.includes(key.toLowerCase())) {
        cleanParams.set(key, value);
      }
    }
    
    url.search = cleanParams.toString();
    
    return {
      original: url.toString(),
      normalized: url.toString(),
      cleaned: false,
      hostname: url.hostname
    };
  }

  static isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
