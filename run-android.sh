#!/bin/bash

echo "🚀 Starting Centscape Android App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

echo "🔧 Starting Expo development server..."
echo "📱 Scan the QR code with Expo Go app on your Android device"
echo "🌐 Or press 'a' to open on Android emulator"
echo ""

# Start Expo development server
npx expo start
