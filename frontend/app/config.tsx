import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Clipboard,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { configService } from '@/services/configService';
import { apiClient } from '@/services/apiClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const ConfigScreen: React.FC = () => {
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState('3000');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animate in the screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Load current configuration
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      await configService.initialize();
      const config = configService.getApiConfig();
      setCurrentConfig(config);
      
      // Check if we have a valid connection (but don't test to avoid rate limiting)
      if (config.baseURL && config.baseURL !== 'http://localhost:3000') {
        console.log('📋 Loaded existing configuration:', config.baseURL);
        // Don't test connection on load to avoid rate limiting
        // User can manually test if needed
      } else {
        console.log('No existing valid connection found');
      }
    } catch (error) {
      console.log('Failed to load configuration:', error);
    }
  };

  const testConnection = async (baseURL?: string) => {
    const urlToTest = baseURL || `http://${serverIP}:${serverPort}`;
    
    if (!baseURL && (!serverIP || !serverPort)) {
      Alert.alert('Error', 'Please enter both server IP and port');
      return false;
    }

    // Prevent multiple simultaneous connection tests
    if (isConnecting) {
      console.log('⚠️ Connection test already in progress, skipping...');
      return false;
    }

    setIsConnecting(true);
    try {
      console.log('🔍 Testing connection to:', urlToTest);
      
      // Use fetch directly for testing to avoid ApiClient complexity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${urlToTest}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('📥 Health check response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Health check response data:', data);
      
      // Check if the response has the expected structure
      if (data && data.success === true) {
        console.log('✅ Server connection successful');
        setIsConnected(true);
        
        // Save the configuration
        await configService.updateApiConfig({
          baseURL: urlToTest,
        });
        
        // Update the main API client
        apiClient.updateConfig({
          baseURL: urlToTest,
        });
        
        // Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload config (but don't test connection again to avoid rate limiting)
        try {
          await configService.initialize();
          const config = configService.getApiConfig();
          setCurrentConfig(config);
        } catch (error) {
          console.log('Failed to reload config:', error);
        }
        
        return true;
      } else {
        throw new Error('Server responded but response format is invalid');
      }
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      setIsConnected(false);
      
      let errorMessage = 'Unable to connect to server';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Connection timed out';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error - server may not be running';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Connection Failed',
        `${errorMessage} at ${urlToTest}\n\nPlease check:\n• Server IP address is correct\n• Port number is correct\n• Server is running\n• Network connection is available\n• Firewall settings`
      );
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!serverIP.trim()) {
      Alert.alert('Error', 'Please enter a server IP address');
      return;
    }

    if (!serverPort.trim()) {
      Alert.alert('Error', 'Please enter a port number');
      return;
    }

    await testConnection();
  };

  const handleProceedToApp = () => {
    router.replace('/addURL');
  };

  const copyDeepLink = () => {
    const deepLink = 'centscape://add';
    Clipboard.setString(deepLink);
    Alert.alert('Deep Link Copied', 'The deep link has been copied to your clipboard!');
  };

  const getCurrentServerURL = () => {
    if (currentConfig?.baseURL && currentConfig.baseURL !== 'http://localhost:3000') {
      return currentConfig.baseURL;
    }
    return 'Not configured';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Back Button - Top Left */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          left: 24,
          zIndex: 10,
          width: 40,
          height: 40,
          backgroundColor: 'rgba(0, 255, 148, 0.1)',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#00ff94',
        }}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#00ff94" />
      </TouchableOpacity>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 100, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header Section */}
          <View style={{
            alignItems: 'center',
            marginBottom: 32,
          }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(0, 255, 148, 0.1)',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 2,
              borderColor: '#00ff94',
            }}>
              <Ionicons name="settings" size={32} color="#00ff94" />
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: 8,
            }}>
              Configuration
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#a1a1aa',
              textAlign: 'center',
            }}>
              Configure your server connection and app settings
            </Text>
          </View>

          {/* Current Connection Status */}
          <View style={{
            backgroundColor: '#0f1b14',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isConnected ? '#00ff94' : '#ef4444',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                width: 24,
                height: 24,
                backgroundColor: isConnected ? 'rgba(0, 255, 148, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                {isConnected ? (
                  <Ionicons name="checkmark" size={16} color="#00ff94" />
                ) : (
                  <Ionicons name="close" size={16} color="#ef4444" />
                )}
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: isConnected ? '#00ff94' : '#ef4444',
              }}>
                {isConnected ? 'Server Connected' : 'Server Not Connected'}
              </Text>
            </View>
            
            <Text style={{
              fontSize: 14,
              color: '#a1a1aa',
              marginBottom: 8,
            }}>
              Current Server URL:
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#ffffff',
              fontFamily: 'monospace',
              backgroundColor: '#1a2922',
              padding: 8,
              borderRadius: 6,
            }}>
              {getCurrentServerURL()}
            </Text>
          </View>

          {/* Server Configuration */}
          <View style={{
            backgroundColor: '#0f1b14',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#374151',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 16,
            }}>
              Server Configuration
            </Text>

            {/* Server IP Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: 8,
              }}>
                Server IP Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#1a2922',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#374151',
                }}
                placeholder="Enter server IP (e.g., 192.168.1.100)"
                placeholderTextColor="#6b7280"
                value={serverIP}
                onChangeText={setServerIP}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                editable={!isConnecting}
              />
            </View>

            {/* Server Port Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: 8,
              }}>
                Server Port
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#1a2922',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#374151',
                }}
                placeholder="Enter port (e.g., 3000)"
                placeholderTextColor="#6b7280"
                value={serverPort}
                onChangeText={setServerPort}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                editable={!isConnecting}
              />
            </View>

            {/* Test Connection Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 8,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isConnecting ? 0.7 : 1,
                shadowColor: '#00ff94',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={handleConnect}
              disabled={isConnecting}
              activeOpacity={0.8}
            >
              {isConnecting ? (
                <View style={{ marginRight: 8 }}>
                  <LoadingSpinner size="small" />
                </View>
              ) : (
                <Ionicons name="wifi" size={20} color="#000000" />
              )}
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: isConnecting ? 0 : 8,
              }}>
                {isConnecting ? 'Testing Connection...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            {/* Debug Connection Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
              onPress={async () => {
                const testUrl = `http://${serverIP || 'localhost'}:${serverPort || '3000'}`;
                console.log('🔍 Debug: Testing connection to:', testUrl);
                try {
                  const response = await fetch(`${testUrl}/health`);
                  console.log('🔍 Debug: Response status:', response.status);
                  console.log('🔍 Debug: Response headers:', Object.fromEntries(response.headers.entries()));
                  const data = await response.text();
                  console.log('🔍 Debug: Response body:', data);
                  Alert.alert('Debug Info', `Status: ${response.status}\nBody: ${data.substring(0, 200)}...`);
                } catch (error) {
                  console.log('🔍 Debug: Error:', error);
                  Alert.alert('Debug Error', error instanceof Error ? error.message : 'Unknown error');
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="bug" size={16} color="#ffffff" />
              <Text style={{
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Debug Connection
              </Text>
            </TouchableOpacity>
          </View>

          {/* Deep Link Section */}
          <View style={{
            backgroundColor: '#0f1b14',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#374151',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 16,
            }}>
              Deep Link
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: '#a1a1aa',
              marginBottom: 12,
              lineHeight: 20,
            }}>
              Use this deep link to add products directly to your wishlist from other apps:
            </Text>
            
            <View style={{
              backgroundColor: '#1a2922',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#374151',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#00ff94',
                fontFamily: 'monospace',
              }}>
                centscape://add
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={copyDeepLink}
              activeOpacity={0.8}
            >
              <Ionicons name="copy" size={18} color="#ffffff" />
              <Text style={{
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Copy Deep Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Deep Link Testing Section */}
          <View style={{
            backgroundColor: '#0f1b14',
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: '#374151',
            marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 20,
            }}>
              Test Deep Links
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: '#a1a1aa',
              marginBottom: 16,
              lineHeight: 20,
            }}>
              Test your deep link functionality:
            </Text>
            
            <View style={{
              backgroundColor: '#1a2922',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 12,
                color: '#00ff94',
                fontFamily: 'monospace',
              }}>
                centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW
              </Text>
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
              onPress={() => {
                router.push({
                  pathname: '/addProduct',
                  params: { url: 'https://www.amazon.com/dp/B08N5WRWNW' }
                });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="link" size={16} color="#000000" />
              <Text style={{
                color: '#000000',
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Test Deep Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Proceed to App Button */}
          {isConnected && (
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                shadowColor: '#00ff94',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={handleProceedToApp}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={20} color="#000000" />
              <Text style={{
                color: '#000000',
                fontSize: 18,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Proceed to App
              </Text>
            </TouchableOpacity>
          )}

          {/* Help Section */}
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: '#3b82f6',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 12,
            }}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={{
                color: '#3b82f6',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
                flex: 1,
              }}>
                Setup Instructions
              </Text>
            </View>
            
            <Text style={{
              color: '#a1a1aa',
              fontSize: 14,
              lineHeight: 20,
            }}>
              • Make sure your backend server is running{'\n'}
              • Use your computer's IP address (not localhost){'\n'}
              • Default port is usually 3000{'\n'}
              • Check your firewall settings{'\n'}
              • Both devices must be on the same network{'\n'}
              • Copy the deep link to share with other apps
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default ConfigScreen;
