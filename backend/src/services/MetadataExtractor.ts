import * as cheerio from 'cheerio';
import axios, { AxiosInstance } from 'axios';

export interface PriceInfo {
  raw: string;
  amount: number;
  currency: string;
}

export interface ImageInfo {
  src: string;
  alt: string;
}

export interface ExtractedMetadata {
  url: string;
  timestamp: string;
  openGraph: Record<string, string> | null;
  twitterCard: Record<string, string> | null;
  fallback: {
    title: string | null;
    description: string | null;
    images: ImageInfo[];
    price: PriceInfo | null;
    author: string | null;
    publishDate: string | null;
    language: string;
    siteName: string | null;
  };
  resolved: {
    title: string;
    description: string | null;
    image: string | null;
    author: string | null;
    publishDate: string | null;
    price: PriceInfo | null;
    siteName: string | null;
    type: string;
    language: string;
  };
}

export class MetadataExtractor {
  private axios: AxiosInstance;
  private priceRegexes: RegExp[];
  private priceSelectors: string[];

  constructor(options: { timeout?: number; userAgent?: string } = {}) {
    const timeout = options.timeout || 15000;
    const userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    this.axios = axios.create({
      timeout,
      headers: { 'User-Agent': userAgent }
    });

    this.priceRegexes = [
      /\$[\d,]+\.?\d*/g,           // $19.99, $1,299
      /€[\d,]+\.?\d*/g,           // €19.99
      /£[\d,]+\.?\d*/g,           // £19.99
      /¥[\d,]+\.?\d*/g,           // ¥1999
      /₹[\d,]+\.?\d*/g,           // ₹999 (Indian Rupee)
      /₽[\d,]+\.?\d*/g,           // ₽999 (Russian Ruble)
      /₩[\d,]+\.?\d*/g,           // ₩999 (Korean Won)
      /₪[\d,]+\.?\d*/g,           // ₪999 (Israeli Shekel)
      /[\d,]+\.?\d*\s*(USD|EUR|GBP|CAD|AUD|INR|JPY|CNY|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RUB|KRW|SGD|HKD|NZD|BRL|MXN|ARS|CLP|COP|PEN|UYU|VND|THB|MYR|IDR|PHP)/gi,
      /price[:\s]+\$?[\d,]+\.?\d*/gi,  // Price: $19.99
      /[\d,]+\.?\d*\s*(dollar|dollars|euro|euros|pound|pounds|rupee|rupees|yen|yuan|peso|pesos|real|reais)/gi,
      /(USD|EUR|GBP|CAD|AUD|INR|JPY|CNY)\s*[\d,]+\.?\d*/gi
    ];

    this.priceSelectors = [
      '.price',
      '.product-price', 
      '.current-price',
      '.sale-price',
      '.price-current',
      '[data-testid*="price"]',
      '[class*="price"]',
      '[id*="price"]',
      '.cost',
      '.amount',
      '[data-a-price-whole]',
      '.a-price-whole',
      '.a-price .a-offscreen'
    ];
  }

  async extractMetadata(url: string): Promise<ExtractedMetadata> {
    console.log(`🔍 Extracting metadata from: ${url}`);
    
    try {
      const response = await this.axios.get(url);
      const $ = cheerio.load(response.data);
      const baseUrl = new URL(url);
      
      const metadata: ExtractedMetadata = {
        url,
        timestamp: new Date().toISOString(),
        openGraph: this.extractOpenGraph($),
        twitterCard: this.extractTwitterCard($),
        fallback: this.extractFallback($, baseUrl),
        resolved: {} as any
      };
      
      metadata.resolved = this.resolveMetadata(metadata);
      return metadata;
      
    } catch (error: any) {
      throw new Error(`Failed to extract metadata from ${url}: ${error.message}`);
    }
  }

  private extractOpenGraph($: cheerio.Root): Record<string, string> | null {
    console.log(`📊 Extracting Open Graph data...`);
    
    const og: Record<string, string> = {};
    
    // Extract Open Graph, Article, and Product meta tags
    const metaSelectors = [
      'meta[property^="og:"]',
      'meta[property^="article:"]',
      'meta[property^="product:"]'
    ];
    
    metaSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const property = $(elem).attr('property');
        const content = $(elem).attr('content');
        
        if (property && content) {
          const key = property.replace(/^(og|article|product):/, '$1_');
          og[key] = content;
        }
      });
    });
    
    console.log(`✅ Open Graph: Found ${Object.keys(og).length} properties`);
    return Object.keys(og).length > 0 ? og : null;
  }

  private extractTwitterCard($: cheerio.Root): Record<string, string> | null {
    console.log(`🐦 Extracting Twitter Card data...`);
    
    const twitter: Record<string, string> = {};
    
    $('meta[name^="twitter:"]').each((i, elem) => {
      const name = $(elem).attr('name');
      const content = $(elem).attr('content');
      
      if (name && content) {
        const key = name.replace('twitter:', '');
        twitter[key] = content;
      }
    });
    
    console.log(`✅ Twitter Card: Found ${Object.keys(twitter).length} properties`);
    return Object.keys(twitter).length > 0 ? twitter : null;
  }

  private extractFallback($: cheerio.Root, baseUrl: URL) {
    console.log(`⚡ Extracting fallback metadata...`);
    
    const fallback = {
      title: this.extractTitle($),
      description: this.extractDescription($),
      images: this.extractImages($, baseUrl),
      price: this.extractPrice($),
      author: this.extractAuthor($),
      publishDate: this.extractPublishDate($),
      language: this.extractLanguage($),
      siteName: this.extractSiteName($)
    };
    
    console.log(`✅ Fallback: Extracted ${Object.keys(fallback).filter(k => fallback[k as keyof typeof fallback]).length} properties`);
    return fallback;
  }

  private extractTitle($: cheerio.Root): string | null {
    const titleSources = [
      () => $('h1').first().text().trim(),
      () => $('title').text().trim(),
      () => $('.title, .post-title, .article-title, .entry-title').first().text().trim(),
      () => $('[data-testid*="title"], [data-test*="title"]').first().text().trim()
    ];
    
    return this.extractFromSources(titleSources, (value): value is string => typeof value === 'string' && value.length > 0);
  }

  private extractDescription($: cheerio.Root): string | null {
    const descSources = [
      () => $('meta[name="description"]').attr('content') || null,
      () => $('.description, .excerpt, .summary, .lead').first().text().trim(),
      () => $('p').first().text().trim().substring(0, 200)
    ];
    
    return this.extractFromSources(descSources, (value): value is string => typeof value === 'string' && value.length > 10);
  }

  private extractImages($: cheerio.Root, baseUrl: URL): ImageInfo[] {
    const images = new Set<string>();
    const imageInfos: ImageInfo[] = [];
    
    console.log(`🔍 Extracting images from ${baseUrl.hostname}...`);
    
    const selectors = {
      highPriority: [
        '.hero-image img',
        '.featured-image img', 
        '.article-image img',
        '.product-image img',
        '.main-image img',
        '.gallery-image img',
        '.product-gallery img',
        '.image-gallery img',
        '.product-photo img',
        '.product-thumbnail img',
        '[data-a-image-name] img',
        '.a-dynamic-image',
        '.a-image-stack-vertical img',
        '.product-media img',
        '.product-visual img',
        '.product-picture img'
      ],
      mediumPriority: [
        'img[src*="product"]',
        'img[src*="image"]',
        'img[src*="photo"]',
        'img[alt*="product"]',
        'img[alt*="image"]'
      ],
      regular: [
        'img[src]',
        'img[data-src]',
        'img[data-lazy-src]'
      ]
    };
    
    console.log(`📋 Using ${selectors.highPriority.length + selectors.mediumPriority.length + selectors.regular.length} selectors`);
    
    const allSelectors = [...selectors.highPriority, ...selectors.mediumPriority, ...selectors.regular];
    
    allSelectors.forEach((selector, index) => {
      const elements = $(selector);
      console.log(`🔍 Selector ${index + 1}: "${selector}" found ${elements.length} elements`);
      
      elements.each((i, elem) => {
        let src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
        const alt = $(elem).attr('alt') || '';
        
        if (src) {
          console.log(`🖼️ Found image: ${src}`);
          src = this.resolveImageUrl(src, baseUrl);
          
          if (this.isValidImage(src) && !images.has(src)) {
            images.add(src);
            imageInfos.push({ src, alt });
            console.log(`✅ Added image: ${src}`);
          } else {
            console.log(`❌ Filtered out image: ${src}`);
          }
        }
      });
    });
    
    // Sort by priority
    const sortedImages = imageInfos.sort((a, b) => {
      const aPriority = this.getImagePriority(a.src);
      const bPriority = this.getImagePriority(b.src);
      return bPriority - aPriority;
    });
    
    console.log(`✅ Images: Found ${sortedImages.length} images`);
    if (sortedImages.length > 0) {
      console.log(`🔝 Top 3 images:`, sortedImages.slice(0, 3).map((img, i) => 
        `${i + 1}. ${img.src} (priority: ${this.getImagePriority(img.src)})`
      ));
    }
    return sortedImages.slice(0, 10);
  }

  private resolveImageUrl(src: string, baseUrl: URL): string {
    if (src.startsWith('//')) {
      return 'https:' + src;
    } else if (src.startsWith('/')) {
      return `${baseUrl.protocol}//${baseUrl.host}${src}`;
    } else if (!src.startsWith('http')) {
      return `${baseUrl.protocol}//${baseUrl.host}/${src}`;
    }
    return src;
  }

  private isValidImage(src: string): boolean {
    return !src.includes('data:') && 
           !src.includes('placeholder') && 
           !src.includes('logo') &&
           !src.includes('icon') &&
           !src.includes('avatar') &&
           !src.includes('banner') &&
           src.length > 10;
  }

  private getImagePriority(src: string): number {
    if (src.includes('product') || src.includes('main') || src.includes('hero')) return 3;
    if (src.includes('image') || src.includes('photo')) return 2;
    return 1;
  }

  private extractPrice($: cheerio.Root): PriceInfo | null {
    // Try structured price selectors first
    for (const selector of this.priceSelectors) {
      const priceElement = $(selector).first();
      if (priceElement.length) {
        const priceText = priceElement.text().trim();
        const price = this.parsePrice(priceText);
        if (price) return price;
      }
    }
    
    // Fallback to regex on entire page content
    const bodyText = $('body').text();
    for (const regex of this.priceRegexes) {
      const matches = bodyText.match(regex);
      if (matches && matches.length > 0) {
        return this.parsePrice(matches[0]);
      }
    }
    
    return null;
  }

  private parsePrice(priceText: string): PriceInfo | null {
    if (!priceText) return null;
    
    const cleaned = priceText.replace(/[^\d.,\$€£¥₹]/g, '');
    const numberMatch = cleaned.match(/[\d,]+\.?\d*/);
    
    if (numberMatch) {
      return {
        raw: priceText,
        amount: parseFloat(numberMatch[0].replace(/,/g, '')),
        currency: this.detectCurrency(priceText)
      };
    }
    
    return null;
  }

  private detectCurrency(priceText: string): string {
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '₽': 'RUB',
      '₩': 'KRW',
      '₪': 'ILS'
    };

    // Check for currency symbols
    for (const [symbol, code] of Object.entries(currencyMap)) {
      if (priceText.includes(symbol)) return code;
    }
    
    // Check for currency codes
    const currencyCodeRegex = /\b(USD|EUR|GBP|CAD|AUD|INR|JPY|CNY|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RUB|KRW|SGD|HKD|NZD|BRL|MXN|ARS|CLP|COP|PEN|UYU|VND|THB|MYR|IDR|PHP)\b/i;
    const currencyMatch = priceText.match(currencyCodeRegex);
    if (currencyMatch) {
      return currencyMatch[0].toUpperCase();
    }
    
    // Check for currency words
    const currencyWords: Record<string, string> = {
      'dollar': 'USD',
      'dollars': 'USD',
      'euro': 'EUR',
      'euros': 'EUR',
      'pound': 'GBP',
      'pounds': 'GBP',
      'rupee': 'INR',
      'rupees': 'INR',
      'yen': 'JPY',
      'yuan': 'CNY',
      'peso': 'MXN',
      'pesos': 'MXN',
      'real': 'BRL',
      'reais': 'BRL'
    };

    for (const [word, code] of Object.entries(currencyWords)) {
      if (new RegExp(word, 'i').test(priceText)) return code;
    }
    
    // Check for regional indicators
    if (/rs\.?|inr/i.test(priceText)) return 'INR';
    if (/cad|canadian/i.test(priceText)) return 'CAD';
    if (/aud|australian/i.test(priceText)) return 'AUD';
    
    return 'USD';
  }

  private extractAuthor($: cheerio.Root): string | null {
    const authorSources = [
      () => $('meta[name="author"]').attr('content') || null,
      () => $('.author, .byline, .writer').first().text().trim(),
      () => $('[rel="author"]').first().text().trim(),
      () => $('.post-author, .article-author').first().text().trim()
    ];
    
    return this.extractFromSources(authorSources, (value): value is string => typeof value === 'string' && value.length > 0 && value.length < 100);
  }

  private extractPublishDate($: cheerio.Root): string | null {
    const dateSources = [
      () => $('meta[name="publish_date"]').attr('content') || null,
      () => $('time[datetime]').attr('datetime') || null,
      () => $('.published, .date, .post-date').first().text().trim()
    ];
    
    return this.extractFromSources(dateSources, (value): value is string => {
      if (typeof value !== 'string') return false;
      try {
        new Date(value);
        return true;
      } catch (e) {
        return false;
      }
    });
  }

  private extractLanguage($: cheerio.Root): string {
    return $('html').attr('lang') || 
           $('meta[http-equiv="content-language"]').attr('content') || 
           'en';
  }

  private extractSiteName($: cheerio.Root): string | null {
    const siteNameSources = [
      () => $('meta[name="application-name"]').attr('content') || null,
      () => $('meta[name="site_name"]').attr('content') || null,
      () => $('title').text().split(' | ').pop() || null
    ];
    
    return this.extractFromSources(siteNameSources, (value): value is string => typeof value === 'string' && value.length > 0);
  }

  private extractFromSources<T>(sources: (() => T)[], validator: (value: T) => value is T): T | null {
    for (const source of sources) {
      const value = source();
      if (validator(value)) {
        return value;
      }
    }
    return null;
  }

  private resolveMetadata(metadata: ExtractedMetadata) {
    return {
      title: metadata.openGraph?.title || 
             metadata.twitterCard?.title || 
             metadata.fallback?.title || 
             'No title found',
      
      description: metadata.openGraph?.description || 
                  metadata.twitterCard?.description || 
                  metadata.fallback?.description || 
                  null,
      
      image: this.resolveBestImage(metadata.openGraph?.image, metadata.twitterCard?.image, metadata.fallback?.images),
      
      author: metadata.openGraph?.article_author || 
              metadata.twitterCard?.creator || 
              metadata.fallback?.author || 
              null,
      
      publishDate: metadata.openGraph?.article_published_time || 
                   metadata.fallback?.publishDate || 
                   null,
      
      price: metadata.openGraph?.product_price_amount ? {
        raw: metadata.openGraph.product_price_amount,
        amount: parseFloat(metadata.openGraph.product_price_amount),
        currency: metadata.openGraph.product_price_currency || 'USD'
      } : metadata.fallback?.price || null,
      
      siteName: metadata.openGraph?.site_name || 
                metadata.twitterCard?.site || 
                metadata.fallback?.siteName || 
                null,
      
      type: metadata.openGraph?.type || 
            metadata.twitterCard?.card || 
            'website',
      
      language: metadata.fallback?.language || 'en'
    };
  }

  private resolveBestImage(ogImage: string | undefined, twitterImage: string | undefined, fallbackImages: ImageInfo[] | undefined): string | null {
    if (ogImage) return ogImage;
    if (twitterImage) return twitterImage;
    
    if (fallbackImages && fallbackImages.length > 0) {
      const sortedFallbackImages = [...fallbackImages].sort((a, b) => {
        const aPriority = this.getImagePriority(a.src);
        const bPriority = this.getImagePriority(b.src);
        return bPriority - aPriority;
      });
      return sortedFallbackImages[0].src;
    }
    
    return null;
  }
}
