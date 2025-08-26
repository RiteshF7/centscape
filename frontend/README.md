# CentScape - Smart Shopping Wishlist App

A React Native mobile application built with Expo that helps users save money for their dream products by creating and managing wishlists.

## 🚀 Features

- **Product Wishlist Management**: Add, view, and remove products from your wishlist
- **URL Preview**: Automatically fetch product information from URLs
- **Progress Tracking**: Monitor your savings progress for each item
- **Modern UI**: Beautiful dark theme with smooth animations
- **Cross-Platform**: Works on iOS, Android, and Web
- **Offline Support**: Data persists locally using AsyncStorage

## 📱 App Flow

1. **Home Screen** (`/addURL`): Main interface to add product URLs
2. **Add Product** (`/addProduct`): Preview and confirm product details
3. **Wishlist** (`/wishlist`): View and manage saved items
4. **Configuration** (`/config`): Debug server URL configuration

## 🏗️ Project Structure

```
centscape-frontend/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout configuration
│   ├── index.tsx                # Redirect to main screen
│   ├── addURL.tsx               # Home screen - add product URLs
│   ├── addProduct.tsx           # Product preview and confirmation
│   ├── wishlist.tsx             # Wishlist management
│   └── config.tsx               # Debug configuration
├── components/                   # Reusable UI components
│   ├── common/                  # Base UI components
│   │   ├── Button.tsx          # Customizable button component
│   │   ├── Card.tsx            # Container component
│   │   ├── Typography.tsx      # Text component with variants
│   │   ├── Input.tsx           # Form input component
│   │   ├── Badge.tsx           # Status indicator component
│   │   ├── IconButton.tsx      # Icon-only button
│   │   └── index.ts            # Component exports
│   ├── UrlPreviewCard.tsx      # Product preview card
│   ├── ErrorDisplay.tsx        # Error state component
│   └── LoadingSpinner.tsx      # Loading indicator
├── hooks/                       # Custom React hooks
│   └── useWishlist.ts          # Wishlist state management
├── types/                       # TypeScript type definitions
│   └── wishlist.ts             # Wishlist and URL preview types
├── constants/                   # App constants
│   └── index.ts                # Routes, text, and configuration
├── utils/                       # Utility functions
│   └── wishlist.ts             # Wishlist helper functions
├── services/                    # API and external services
└── android/                     # Android-specific files
```

## 🎨 Design System

### Colors
- **Primary**: `#00ff94` (Green accent)
- **Background**: `#0a0f0d` (Dark background)
- **Surface**: `#0f1b14` (Card background)
- **Border**: `#374151` (Gray borders)
- **Text Primary**: `#ffffff` (White text)
- **Text Secondary**: `#a1a1aa` (Gray text)

### Components
- **Button**: Primary, secondary, and ghost variants with different sizes
- **Card**: Container with customizable padding, shadow, and border
- **Typography**: Text component with hero, heading, body, and caption variants
- **Input**: Form input with label, error states, and icons
- **Badge**: Status indicators with success, warning, error, and info variants

## 🛠️ Technologies Used

### Core
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **Expo Router**: File-based navigation

### UI & Styling
- **React Native Animated**: Smooth animations
- **Expo Linear Gradient**: Gradient backgrounds
- **@expo/vector-icons**: Icon library (Ionicons)

### State Management
- **React Hooks**: Local state management
- **AsyncStorage**: Local data persistence

### Development Tools
- **ESLint**: Code linting
- **Metro**: React Native bundler
- **Babel**: JavaScript compiler

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd centscape-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on different platforms**
   ```bash
   npm run web      # Web browser
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   ```

## 🔧 Configuration

### Debug Configuration
The app includes a debug configuration button at the bottom of the home screen for setting up server URLs during development.

### Environment Variables
Create a `.env` file in the root directory for environment-specific configuration:
```env
API_BASE_URL=http://localhost:3000
```

## 📱 Usage

### Adding Products
1. Open the app and navigate to the home screen
2. Paste a product URL (Amazon, eBay, etc.) in the input field
3. Click "Add to Wishlist" to preview the product
4. Confirm the product details and add to wishlist

### Managing Wishlist
1. Navigate to the wishlist screen
2. View your saved products with progress tracking
3. Remove items using the "Remove from Wishlist" button
4. Monitor your total savings progress

## 🧪 Testing

### Manual Testing
- Test URL input validation
- Verify wishlist add/remove functionality
- Check data persistence across app restarts
- Test responsive design on different screen sizes

### Debug Features
- Use the debug configuration button for server setup
- Check browser console for development logs
- Use React Native Debugger for advanced debugging

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
```bash
expo build:android  # Android APK
expo build:ios      # iOS IPA
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the code comments for implementation details

## 🔄 Version History

- **v1.0.0**: Initial release with core wishlist functionality
- Basic product management
- URL preview system
- Modern UI design
- Cross-platform support
