import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import axios from 'axios';
import os from 'os';
import QRCode from 'qrcode';

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Log incoming request
  console.log(`📥 [${requestId}] ${req.method} ${req.path} - ${req.ip}`);
  console.log(`📋 [${requestId}] Headers:`, {
    'User-Agent': req.get('User-Agent'),
    'Content-Type': req.get('Content-Type'),
    'Accept': req.get('Accept'),
    'Origin': req.get('Origin'),
    'Referer': req.get('Referer')
  });
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 [${requestId}] Request Body:`, JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`🔍 [${requestId}] Query Parameters:`, JSON.stringify(req.query, null, 2));
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 [${requestId}] Response (${duration}ms):`, JSON.stringify(data, null, 2));
    console.log(`✅ [${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalJson.call(this, data);
  };
  
  // Override res.status to capture status code
  const originalStatus = res.status;
  res.status = function(code) {
    console.log(`📊 [${requestId}] Status Code: ${code}`);
    return originalStatus.call(this, code);
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
    
    console.log('🔗 URL Normalization Request:', { url });
    
    if (!url) {
      console.log('❌ Missing URL in request');
      return res.status(400).json(createResponse(false, null, 'URL is required', 'MISSING_URL'));
    }
    
    const normalized = UrlNormalizer.normalize(url);
    console.log('✅ URL Normalization Result:', normalized);
    res.json(createResponse(true, normalized));
    
  } catch (error: any) {
    console.error('❌ URL Normalization Error:', error);
    handleError(res, error, 'URL normalization failed', 'NORMALIZATION_ERROR');
  }
});

// Metadata extraction endpoint
app.post('/extract-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('🔍 Metadata Extraction Request:', { url });
    
    if (!url) {
      console.log('❌ Missing URL in metadata extraction request');
      return res.status(400).json(createResponse(false, null, 'URL is required', 'MISSING_URL'));
    }
    
    // Validate URL
    if (!UrlNormalizer.isValidUrl(url)) {
      console.log('❌ Invalid URL provided:', url);
      return res.status(400).json(createResponse(false, null, 'Invalid URL provided', 'INVALID_URL'));
    }
    
    // Normalize URL first
    const normalized = UrlNormalizer.normalize(url);
    console.log('🔗 URL Normalization:', {
      original: normalized.original,
      normalized: normalized.normalized,
      cleaned: normalized.cleaned
    });
    
    // Extract metadata using normalized URL
    console.log('⏳ Starting metadata extraction for:', normalized.normalized);
    const extractor = new MetadataExtractor({ timeout: 15000 });
    const metadata = await extractor.extractMetadata(normalized.normalized);
    console.log('✅ Metadata extraction completed:', {
      title: metadata.resolved.title,
      price: metadata.resolved.price,
      image: metadata.resolved.image ? 'Found' : 'Not found',
      siteName: metadata.resolved.siteName
    });
    
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
    console.error('❌ Metadata extraction error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('❌ Fetch failed - site may be blocking requests');
      return res.status(400).json(createResponse(false, null, 'Failed to fetch URL - site may be blocking requests', 'FETCH_FAILED'));
    }
    
    handleError(res, error, 'Metadata extraction failed', 'EXTRACTION_ERROR');
  }
});

// Legacy preview endpoint (for backward compatibility)
app.post('/preview', async (req, res) => {
  try {
    const { url, raw_html } = req.body;
    
    console.log('👁️ Preview Request:', { url, hasRawHtml: !!raw_html });
    
    if (!url && !raw_html) {
      console.log('❌ Missing content in preview request');
      return res.status(400).json(createResponse(false, null, 'Either url or raw_html must be provided', 'MISSING_CONTENT'));
    }
    
    if (raw_html) {
      console.log('❌ Raw HTML processing not implemented');
      return res.status(400).json(createResponse(false, null, 'Raw HTML processing not implemented yet', 'NOT_IMPLEMENTED'));
    }
    
    // Handle URL case by redirecting to new endpoint
    console.log('⏳ Processing URL in preview endpoint:', url);
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
    
    console.log('✅ Preview response formatted:', {
      title: response.title,
      hasImage: !!response.image,
      hasPrice: !!response.price,
      siteName: response.siteName
    });
    
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Preview endpoint error:', error);
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
    
    console.log(`🖼️ Proxying image: ${url}`);
    
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
    
    console.log(`✅ Image proxied successfully: ${url}`);
    
    // Stream the image
    response.data.pipe(res);
    
  } catch (error: any) {
    console.error('❌ Image proxy error:', error.message);
    res.status(500).json(createResponse(false, null, 'Failed to proxy image', 'PROXY_ERROR'));
  }
});

// QR Code endpoint
app.get('/qr-code', async (req, res) => {
  try {
    const { baseurl } = req.query;
    if (!baseurl || typeof baseurl !== 'string') {
      return res.status(400).json(createResponse(false, null, 'Base URL is required for QR code generation', 'MISSING_BASE_URL'));
    }

    const qrData = JSON.stringify({ baseurl });
    const qrCode = await QRCode.toDataURL(qrData);

    res.json(createResponse(true, {
      qrCode,
      qrData
    }));
  } catch (error: any) {
    handleError(res, error, 'QR Code generation error', 'QR_CODE_ERROR');
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

const generateQRCodeData = async (url: string) => {
  const qrData = JSON.stringify({ baseurl: url });
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { 
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return { qrData, qrCodeDataUrl };
  } catch (err) {
    console.log(`❌ QR Code generation failed: ${err}`);
    return { qrData, qrCodeDataUrl: null };
  }
};

const generateASCIIQRCode = (data: string) => {
  const qrSize = 21;
  const qr = Array(qrSize).fill(null).map(() => Array(qrSize).fill(' '));
  
  // Add finder patterns
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i === 0 || i === 6 || j === 0 || j === 6) || 
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        qr[i][j] = '█';
        qr[i][qrSize-1-j] = '█';
        qr[qrSize-1-i][j] = '█';
      }
    }
  }
  
  // Add alignment pattern
  for (let i = qrSize-9; i < qrSize-4; i++) {
    for (let j = qrSize-9; j < qrSize-4; j++) {
      if ((i === qrSize-9 || i === qrSize-5 || j === qrSize-9 || j === qrSize-5) || 
          (i === qrSize-7 && j === qrSize-7)) {
        qr[i][j] = '█';
      }
    }
  }
  
  // Add data representation
  let dataIndex = 0;
  for (let i = 7; i < qrSize-7; i += 2) {
    for (let j = 7; j < qrSize-7; j += 2) {
      if (dataIndex < data.length) {
        qr[i][j] = data.charCodeAt(dataIndex) % 2 === 0 ? '█' : ' ';
        dataIndex++;
      }
    }
  }
  
  return qr.map(row => row.join(''));
};

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Centscape Backend Server v${VERSION.toString()}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔧 Debug mode: ${currentConfig.debug}`);
  console.log(`🌐 Server running on port ${PORT}`);
  
  const networkUrls = getNetworkInterfaces();
  
  console.log(`🔗 Local URLs:`);
  console.log(`   • Localhost: http://localhost:${PORT}`);
  
  // Display network IPs and generate QR codes
  for (const networkUrl of networkUrls) {
    console.log(`   • Network: ${networkUrl}`);
    
    const { qrData, qrCodeDataUrl } = await generateQRCodeData(networkUrl);
    console.log(`   📱 QR Code Data: ${qrData}`);
    
    if (qrCodeDataUrl) {
      console.log(`   📱 QR Code Data URL: ${qrCodeDataUrl.substring(0, 50)}...`);
      console.log(`   🔗 QR Code Endpoint: ${networkUrl}/qr-code?baseurl=${encodeURIComponent(networkUrl)}`);
    }
    
    // Generate ASCII QR code
    console.log(`   📱 QR Code (ASCII):`);
    const asciiQR = generateASCIIQRCode(qrData);
    asciiQR.forEach(line => console.log(`      ${line}`));
  }
  
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Version info: http://localhost:${PORT}/version`);
  console.log(`🔗 URL normalization: http://localhost:${PORT}/normalize-url`);
  console.log(`🔍 Metadata extraction: http://localhost:${PORT}/extract-metadata`);
  console.log(`🧪 Testing interface: http://localhost:${PORT}/`);
  console.log(`📱 Server info (JSON): http://localhost:${PORT}/server-info`);
  console.log(`🔗 QR Code generator: http://localhost:${PORT}/qr-code?baseurl=http://localhost:${PORT}`);
});

export default app;

