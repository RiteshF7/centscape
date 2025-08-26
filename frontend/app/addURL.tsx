import { ROUTES, DEEP_LINKING } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { configService } from '@/services/configService';
import { apiClient } from '@/services/apiClient';



const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entry animations
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();


  }, []);



  const handleSubmitUrl = async () => {
    console.log('🎯 addURL: Submit URL triggered', { url: url.trim() });
    
    if (!url.trim()) {
      console.log('❌ addURL: Empty URL submitted');
      Alert.alert('Missing URL', 'Please enter a product URL to start saving');
      return;
    }

    if (!isValidUrl(url)) {
      console.log('❌ addURL: Invalid URL submitted', { url: url.trim() });
      Alert.alert('Invalid URL', 'Please enter a valid product URL');
      return;
    }

    console.log('✅ addURL: Valid URL submitted, navigating to add product', { 
      url: url.trim(),
      route: `/${ROUTES.ADD}?url=${encodeURIComponent(url.trim())}`
    });
    
    router.push(`/${ROUTES.ADD}?url=${encodeURIComponent(url.trim())}`);
  };

  const handleConfigPress = () => {
    console.log('⚙️ addURL: Config button pressed, navigating to config');
    router.push(`/${ROUTES.CONFIG}`);
  };

  const isValidUrl = (url: string) => {
    try {
      const isValid = new URL(url.startsWith('http') ? url : `https://${url}`);
      console.log('🔍 addURL: URL validation', { url, isValid: !!isValid });
      return true;
    } catch (error) {
      console.log('❌ addURL: URL validation failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  };

  const glowStyle = {
    shadowColor: '#00ff94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.4],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 20],
    }),
    elevation: 15,
  };

  // Mock data for wishlist items
  const savingGoals = [
    { id: 1, product: 'iPhone 15 Pro', saved: 650, target: 999, progress: 65 },
    { id: 2, product: 'MacBook Air', saved: 420, target: 1299, progress: 32 },
    { id: 3, product: 'AirPods Pro', saved: 180, target: 249, progress: 72 }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section with Radial Gradient */}
        <LinearGradient
          colors={['#0a0f0d', '#111b17', '#0a0f0d']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ paddingTop: 100, paddingBottom: 32 }}
        >
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

          {/* Config Button - Top Right */}
          <View style={{
            position: 'absolute',
            top: 50,
            right: 24,
            zIndex: 10,
          }}>
            <TouchableOpacity 
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'rgba(0, 255, 148, 0.1)',
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#00ff94',
              }}
              onPress={handleConfigPress}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#00ff94" />
            </TouchableOpacity>
          </View>

         <Animated.View 
           style={{
             alignItems: 'center',
             paddingHorizontal: 24,
             opacity: fadeAnim,
             transform: [{ scale: scaleAnim }],
           }}
         >
          {/* Logo with Glow Effect */}
          <Animated.View 
            style={[
              {
                width: 80,
                height: 80,
                backgroundColor: 'rgba(0, 255, 148, 0.1)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#00ff94',
              },
              glowStyle
            ]}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00ff94',
                shadowColor: '#00ff94',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons name="gift" size={28} color="#000000" />
            </View>
          </Animated.View>
          
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            CentScape
          </Text>
          <Text style={{
            color: '#a1a1aa',
            fontSize: 18,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            Save money for your dream products
          </Text>
        </Animated.View>
      </LinearGradient>

                            <Animated.View 
                 style={{
                   paddingHorizontal: 24,
                   transform: [{ translateY: slideAnim }],
                 }}
               >


          {/* Main Product URL Card */}
           <View style={{
             backgroundColor: '#0f1b14',
             borderRadius: 8,
             padding: 20,
             marginBottom: 20,
             borderWidth: 1,
             borderColor: '#374151',
             shadowColor: '#000',
             shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.2,
             shadowRadius: 8,
             elevation: 8,
           }}>
                         <Text style={{
               fontSize: 18,
               fontWeight: '600',
               color: '#ffffff',
               marginBottom: 20,
               textAlign: 'center',
             }}>
               Add Product to Wishlist
             </Text>
            
                         {/* URL Input */}
             <View style={{
               flexDirection: 'row',
               alignItems: 'center',
               borderWidth: 2,
               borderColor: inputFocused ? '#00ff94' : '#374151',
               borderRadius: 6,
               paddingHorizontal: 12,
               marginBottom: 20,
               backgroundColor: inputFocused ? '#111b17' : '#111b17',
             }}>
              <Ionicons 
                name="link-outline" 
                size={20} 
                color={inputFocused ? '#00ff94' : '#6b7280'} 
              />
                             <TextInput
                 style={{
                   flex: 1,
                   marginStart: 12,
                   marginEnd: 12,
                   paddingVertical: 14,
                   paddingHorizontal: 8,
                   color: '#ffffff',
                   fontSize: 14,
                 }}
                value={url}
                onChangeText={setUrl}
                placeholder="Paste product URL (Amazon, eBay, etc.)"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleSubmitUrl}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              {url.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setUrl('')}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
            
                         {/* Add to Wishlist Button */}
             <TouchableOpacity 
               style={{
                 backgroundColor: '#00ff94',
                 borderRadius: 8,
                 flexDirection: 'row',
                 alignItems: 'center',
                 justifyContent: 'center',
                 paddingVertical: 14,
                 opacity: !isValidUrl(url) ? 0.5 : 1,
                 shadowColor: '#00ff94',
                 shadowOffset: { width: 0, height: 2 },
                 shadowOpacity: 0.3,
                 shadowRadius: 4,
                 elevation: 4,
               }}
               onPress={handleSubmitUrl}
               disabled={!isValidUrl(url)}
               activeOpacity={0.8}
             >
               <Ionicons name="heart" size={18} color="#000000" />
               <Text style={{
                 color: '#000000',
                 fontSize: 16,
                 fontWeight: '600',
                 marginLeft: 8,
               }}>
                 Add to Wishlist
               </Text>



            </TouchableOpacity>
            
            <Text style={{
              color: '#a1a1aa',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 20,
            }}>
              Add products to your wishlist and start saving money for them
            </Text>
          </View>



          {/* Savings Overview Stats */}
          <View style={{
            flexDirection: 'row',
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              { title: 'Total Saved', value: '$1,250', icon: 'wallet-outline', color: '#00ff94' },
              { title: 'Wishlist Items', value: '3', icon: 'heart-outline', color: '#00e5ff' },
              { title: 'Purchased', value: '7', icon: 'checkmark-circle-outline', color: '#10b981' }
            ].map((stat, index) => (
                             <View key={index} style={{
                 flex: 1,
                 backgroundColor: '#0f1b14',
                 borderRadius: 8,
                 padding: 16,
                 borderWidth: 1,
                 borderColor: stat.color,
                 alignItems: 'center',
                 shadowColor: stat.color,
                 shadowOffset: { width: 0, height: 0 },
                 shadowOpacity: 0.2,
                 shadowRadius: 8,
                 elevation: 8,
               }}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                <Text style={{
                  color: stat.color,
                  fontSize: 18,
                  fontWeight: '700',
                  marginTop: 8,
                }}>
                  {stat.value}
                </Text>
                <Text style={{
                  color: '#a1a1aa',
                  fontSize: 12,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>

                     {/* Your Wishlist */}
           <View style={{
             backgroundColor: '#0f1b14',
             borderRadius: 8,
             padding: 24,
             borderWidth: 1,
             borderColor: '#374151',
             marginBottom: 24,
           }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 16,
            }}>
              Your Wishlist
            </Text>
            
            {savingGoals.map((goal, index) => (
              <TouchableOpacity key={goal.id} style={{
                paddingVertical: 16,
                borderBottomWidth: index < savingGoals.length - 1 ? 1 : 0,
                borderBottomColor: '#374151',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#1a2922',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons name="heart" size={20} color="#00ff94" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '500',
                      marginBottom: 4,
                    }}>
                      {goal.product}
                    </Text>
                    <Text style={{
                      color: '#a1a1aa',
                      fontSize: 14,
                    }}>
                      ${goal.saved} of ${goal.target} saved
                    </Text>
                  </View>
                  <Text style={{
                    color: '#00ff94',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {goal.progress}%
                  </Text>
                </View>
                
                {/* Progress Bar */}
                <View style={{
                  height: 6,
                  backgroundColor: '#374151',
                  borderRadius: 3,
                  marginLeft: 52,
                }}>
                  <View style={{
                    height: 6,
                    backgroundColor: '#00ff94',
                    borderRadius: 3,
                    width: `${goal.progress}%`,
                  }} />
                </View>
              </TouchableOpacity>
            ))}
            
            
          </View>

                     {/* Quick Actions */}
           <TouchableOpacity 
             style={{
               backgroundColor: '#00ff94',
               borderRadius: 6,
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'center',
               paddingVertical: 14,
               marginBottom: 20,
             }}
             onPress={() => router.push(`/${ROUTES.WISHLIST}`)}
             activeOpacity={0.8}
           >
             <Ionicons name="heart" size={18} color="#000000" />
             <Text style={{
               color: '#000000',
               fontSize: 16,
               fontWeight: '600',
               marginLeft: 8,
             }}>
               View Full Wishlist
             </Text>


          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;