# CentScape Backend - Metadata Extraction Service

A robust Node.js/TypeScript backend service for extracting metadata from web pages, with advanced URL normalization, image processing, and QR code generation capabilities.

## 🚀 Features

- **Metadata Extraction**: Extract Open Graph, Twitter Card, and fallback metadata from any web page
- **URL Normalization**: Clean and normalize URLs for better extraction results
- **Image Processing**: Advanced image extraction with priority-based selection and CORS proxy
- **QR Code Generation**: Generate QR codes containing server information for easy access
- **Network Detection**: Automatically detect and display local network IP addresses
- **CORS Handling**: Built-in image proxy to handle cross-origin resource sharing issues
- **Rate Limiting**: Protect against abuse with configurable rate limiting
- **Security**: Helmet.js security headers and input validation

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Main Express application
│   └── services/
│       ├── MetadataExtractor.ts # Core metadata extraction logic
│       └── UrlNormalizer.ts     # URL normalization and validation
├── public/
│   └── test.html               # Testing interface for metadata extraction
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🏗️ Architecture

### Core Components

#### 1. **Express Application (`src/index.ts`)**
- **Purpose**: Main server entry point with route handling and middleware
- **Key Features**:
  - Common response helper functions
  - Centralized error handling
  - Security middleware (Helmet, CORS, Rate Limiting)
  - QR code generation endpoints
  - Image proxy for CORS handling

#### 2. **Metadata Extractor (`src/services/MetadataExtractor.ts`)**
- **Purpose**: Extract structured metadata from web pages
- **Extraction Methods**:
  - **Open Graph**: Meta tags with `og:` prefix
  - **Twitter Card**: Meta tags with `twitter:` prefix
  - **Fallback**: HTML parsing for title, description, images, prices
- **Image Processing**:
  - Priority-based image selection
  - Relative URL resolution
  - Filtering of non-content images (logos, icons, etc.)
- **Price Detection**: Multi-currency support with regex patterns

#### 3. **URL Normalizer (`src/services/UrlNormalizer.ts`)**
- **Purpose**: Clean and normalize URLs for consistent processing
- **Features**:
  - Remove tracking parameters
  - Extract product IDs
  - Validate URL format
  - Handle various URL formats

### Data Flow

```
1. Client Request → Express Router
2. URL Validation → UrlNormalizer
3. URL Normalization → Clean URL
4. Web Page Fetch → Axios HTTP Client
5. HTML Parsing → Cheerio
6. Metadata Extraction → MetadataExtractor
   ├── Open Graph Data
   ├── Twitter Card Data
   └── Fallback Data
7. Image Processing → Priority Selection
8. Response Formatting → JSON Response
9. Client Response ← Structured Metadata
```

## 🛠️ API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/version` | API version information |
| `GET` | `/server-info` | Server information with base URL |
| `POST` | `/normalize-url` | Normalize and clean URLs |
| `POST` | `/extract-metadata` | Extract metadata from URL |
| `GET` | `/proxy-image` | Image proxy for CORS handling |
| `GET` | `/qr-code` | Generate QR codes |

### Request/Response Examples

#### Extract Metadata
```bash
POST /extract-metadata
Content-Type: application/json

{
  "url": "https://example.com/product"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/product",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "openGraph": { "title": "Product Title", "image": "..." },
    "twitterCard": { "title": "Product Title", "image": "..." },
    "fallback": { "title": "Product Title", "images": [...] },
    "resolved": {
      "title": "Product Title",
      "description": "Product description",
      "image": "https://example.com/image.jpg",
      "price": { "raw": "$19.99", "amount": 19.99, "currency": "USD" }
    },
    "urlTransformation": {
      "original": "https://example.com/product?ref=123",
      "normalized": "https://example.com/product",
      "cleaned": true,
      "productId": "product123",
      "hostname": "example.com"
    }
  }
}
```

#### Generate QR Code
```bash
GET /qr-code?baseurl=http://192.168.1.100:3000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrData": "{\"baseurl\":\"http://192.168.1.100:3000\"}"
  }
}
```

## 🎨 UI Components

### Testing Interface (`public/test.html`)

A comprehensive testing interface with the following features:

- **Modern Design**: Gradient backgrounds and card-based layout
- **Real-time Testing**: Test metadata extraction with sample URLs
- **Image Display**: Visual representation of extracted images with fallback handling
- **Debug Information**: Toggle raw JSON data for troubleshooting
- **Responsive Layout**: Works on desktop and mobile devices

#### Key UI Components:
- **URL Display**: Shows the test URL being processed
- **Test Button**: Triggers metadata extraction
- **Loading States**: Visual feedback during processing
- **Metadata Sections**: Organized display of extracted data
- **Image Containers**: Handle image loading with proxy fallback
- **Debug Panel**: Raw data inspection

## 📚 Libraries and Dependencies

### Core Dependencies
- **Express.js**: Web framework for Node.js
- **TypeScript**: Type-safe JavaScript development
- **Axios**: HTTP client for web requests
- **Cheerio**: Server-side jQuery for HTML parsing
- **QRCode**: QR code generation library

### Security & Middleware
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting protection

### Development Dependencies
- **@types/node**: TypeScript definitions for Node.js
- **@types/express**: TypeScript definitions for Express
- **@types/cors**: TypeScript definitions for CORS
- **@types/qrcode**: TypeScript definitions for QRCode

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment (development/production)
ALLOWED_ORIGINS=*           # CORS origins (production)
```

## 🔧 Configuration

### Development vs Production
The application automatically configures itself based on the `NODE_ENV`:

- **Development**: Debug mode enabled, permissive CORS
- **Production**: Debug disabled, restricted CORS origins

### Rate Limiting
- **Window**: 1 minute
- **Max Requests**: 10 per IP address
- **Headers**: Standard rate limit headers

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Click "Test Metadata Extraction" to test with sample URL
4. View extracted metadata in organized sections

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Extract metadata
curl -X POST http://localhost:3000/extract-metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Generate QR code
curl "http://localhost:3000/qr-code?baseurl=http://localhost:3000"
```

## 🔍 Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Check CORS settings on target website
   - Use the built-in image proxy: `/proxy-image?url=<image-url>`

2. **Metadata Extraction Fails**
   - Verify URL is accessible
   - Check if website blocks automated requests
   - Review console logs for detailed error messages

3. **QR Code Generation Issues**
   - Ensure `qrcode` library is installed
   - Check base URL format

### Debug Information
- Enable debug mode in development
- Use the debug panel in the test interface
- Check server console logs for detailed information

## 🔒 Security Considerations

- **Input Validation**: All URLs are validated before processing
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Security Headers**: Helmet.js provides comprehensive security headers
- **CORS Configuration**: Properly configured for cross-origin requests
- **Error Handling**: No sensitive information leaked in error messages

## 📈 Performance

- **Caching**: Image proxy includes 1-hour cache headers
- **Timeout**: 15-second timeout for web requests
- **Image Limits**: Maximum 10 images extracted per page
- **Response Size**: JSON responses limited to 1MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the debug information
3. Create an issue with detailed error logs

