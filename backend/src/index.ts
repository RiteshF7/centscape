import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import axios from 'axios';
import os from 'os';

import { MetadataExtractor } from './services/MetadataExtractor';
import { UrlNormalizer } from './services/UrlNormalizer';

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  toString: () => `${VERSION.major}.${VERSION.minor}.${VERSION.patch}`
};

const config = {
  development: {
    debug: true,
    logLevel: 'debug',
    cors: { origin: '*' }
  },
  production: {
    debug: false,
    logLevel: 'info',
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'] }
  }
};

const currentConfig = config[NODE_ENV as keyof typeof config] || config.development;

// Initialize Express app
const app = express();

// Common response helper
const createResponse = (success: boolean, data?: any, error?: string, code?: string) => ({
  success,
  ...(data && { data }),
  ...(error && { error }),
  ...(code && { code })
});

// Common error handler
const handleError = (res: express.Response, error: any, defaultMessage: string, defaultCode: string) => {
  console.error(`${defaultMessage}:`, error);
  res.status(500).json(createResponse(false, null, defaultMessage, defaultCode));
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  },
}));

// CORS middleware
app.use(cors({
  ...currentConfig.cors,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      const error = e as Error;
      console.error('JSON parsing error:', error.message);
      throw new Error('Invalid JSON');
    }
  }
}));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// Response headers middleware
app.use((req, res, next) => {
  res.setHeader('X-API-Version', VERSION.toString());
  res.setHeader('X-Environment', NODE_ENV);
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  console.log(`📥 ${req.method} ${req.path} - ${req.ip}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalJson.call(this, data);
  };
  
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json(createResponse(true, {
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: VERSION.toString(),
    environment: NODE_ENV,
    debug: currentConfig.debug
  }));
});

app.get('/version', (req, res) => {
  res.json(createResponse(true, {
    version: VERSION.toString(),
    major: VERSION.major,
    minor: VERSION.minor,
    patch: VERSION.patch,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  }));
});

// URL normalization endpoint
app.post('/normalize-url', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json(createResponse(false, null, 'URL is required', 'MISSING_URL'));
    }
    
    const normalized = UrlNormalizer.normalize(url);
    res.json(createResponse(true, normalized));
    
  } catch (error: any) {
    handleError(res, error, 'URL normalization failed', 'NORMALIZATION_ERROR');
  }
});

// Metadata extraction endpoint
app.post('/extract-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json(createResponse(false, null, 'URL is required', 'MISSING_URL'));
    }
    
    // Validate URL
    if (!UrlNormalizer.isValidUrl(url)) {
      return res.status(400).json(createResponse(false, null, 'Invalid URL provided', 'INVALID_URL'));
    }
    
    // Normalize URL first
    const normalized = UrlNormalizer.normalize(url);
    
    // Extract metadata using normalized URL
    const extractor = new MetadataExtractor({ timeout: 15000 });
    const metadata = await extractor.extractMetadata(normalized.normalized);
    
    // Add URL transformation info
    const response = {
      ...metadata,
      urlTransformation: {
        original: normalized.original,
        normalized: normalized.normalized,
        cleaned: normalized.cleaned,
        productId: normalized.productId,
        hostname: normalized.hostname
      }
    };
    
    res.json(createResponse(true, response));
    
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      return res.status(400).json(createResponse(false, null, 'Failed to fetch URL - site may be blocking requests', 'FETCH_FAILED'));
    }
    
    handleError(res, error, 'Metadata extraction failed', 'EXTRACTION_ERROR');
  }
});

// Legacy preview endpoint (for backward compatibility)
app.post('/preview', async (req, res) => {
  try {
    const { url, raw_html } = req.body;
    
    if (!url && !raw_html) {
      return res.status(400).json(createResponse(false, null, 'Either url or raw_html must be provided', 'MISSING_CONTENT'));
    }
    
    if (raw_html) {
      return res.status(400).json(createResponse(false, null, 'Raw HTML processing not implemented yet', 'NOT_IMPLEMENTED'));
    }
    
    // Handle URL case by redirecting to new endpoint
    const normalized = UrlNormalizer.normalize(url);
    const extractor = new MetadataExtractor({ timeout: 15000 });
    const metadata = await extractor.extractMetadata(normalized.normalized);
    
    // Format response in the requested format
    const response = {
      title: metadata.resolved.title || 'No title found',
      image: metadata.resolved.image || null,
      price: metadata.resolved.price ? metadata.resolved.price.raw : null,
      currency: metadata.resolved.price ? metadata.resolved.price.currency : null,
      siteName: metadata.resolved.siteName || null,
      sourceUrl: normalized.normalized
    };
    
    res.json(response);
    
  } catch (error: any) {
    handleError(res, error, 'Preview endpoint error', 'INTERNAL_ERROR');
  }
});

// Image proxy endpoint to handle CORS issues
app.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json(createResponse(false, null, 'Image URL is required', 'MISSING_IMAGE_URL'));
    }
    
    // Validate URL
    if (!UrlNormalizer.isValidUrl(url)) {
      return res.status(400).json(createResponse(false, null, 'Invalid image URL provided', 'INVALID_IMAGE_URL'));
    }
    
    // Fetch the image
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(url).origin
      }
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Stream the image
    response.data.pipe(res);
    
  } catch (error: any) {
    res.status(500).json(createResponse(false, null, 'Failed to proxy image', 'PROXY_ERROR'));
  }
});

// Server info endpoint that returns JSON with base URL
app.get('/server-info', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  res.json({
    baseurl: baseUrl,
    version: VERSION.toString(),
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json(createResponse(false, null, 'Internal server error', 'UNHANDLED_ERROR'));
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json(createResponse(false, null, 'Endpoint not found', 'NOT_FOUND'));
});

// Utility functions
const getNetworkInterfaces = () => {
  const networkInterfaces = os.networkInterfaces();
  const interfaces: string[] = [];
  
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName]?.forEach((iface: any) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        interfaces.push(`http://${iface.address}:${PORT}`);
      }
    });
  });
  
  return interfaces;
};

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Centscape Backend Server v${VERSION.toString()}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔧 Debug mode: ${currentConfig.debug}`);
  console.log(`🌐 Server running on port ${PORT}`);
  
  const networkUrls = getNetworkInterfaces();
  
  console.log(`🔗 Available URLs:`);
  console.log(`   • Localhost: http://localhost:${PORT}`);
  
  // Display network IPs
  networkUrls.forEach(url => {
    console.log(`   • Network: ${url}`);
  });
  
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Version info: http://localhost:${PORT}/version`);
  console.log(`🔗 Server info: http://localhost:${PORT}/server-info`);
  console.log(`🔍 Metadata extraction: http://localhost:${PORT}/extract-metadata`);
});

export default app;

