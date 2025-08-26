import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UrlPreviewCard } from '@/components/UrlPreviewCard';
import { ROUTES } from '@/constants';
import { useUrlPreview } from '@/hooks/useUrlPreview';
import { useWishlist } from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const AddScreen: React.FC = () => {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { preview, loading, error, retry } = useUrlPreview(url || null);
  const { addItem } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToWishlist = async () => {
    if (!preview) {
      return;
    }

    setIsAdding(true);
    try {
      await addItem(preview);
      setShowSuccess(true);
      // Success message stays visible until user navigates away
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      Alert.alert('Error', 'Failed to add item to wishlist');
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewWishlist = () => {
    router.replace(`/${ROUTES.WISHLIST}`);
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0a0f0d',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
        
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: 'rgba(0, 255, 148, 0.1)',
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#00ff94',
        }}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0a0f0d',
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
        
        {/* Back Button */}
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
        
        {/* Error Container */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            backgroundColor: '#0f1b14',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#ef4444',
          }}>
            {/* Error Icon */}
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              borderWidth: 2,
              borderColor: '#ef4444',
            }}>
              <Ionicons name="alert-circle" size={40} color="#ef4444" />
            </View>
            
            {/* Error Title */}
            <Text style={{
              fontSize: 20,
              color: '#ffffff',
              fontWeight: '700',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Preview Error
            </Text>
            
            {/* Error Message */}
            <Text style={{
              fontSize: 16,
              color: '#a1a1aa',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
              maxWidth: 280,
            }}>
              {error}
            </Text>
            
            {/* Action Buttons */}
            <View style={{
              width: '100%',
              gap: 12,
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#00ff94',
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                }}
                onPress={retry}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color="#000000" />
                <Text style={{
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  Try Again
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: '#374151',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color="#a1a1aa" />
                <Text style={{
                  color: '#a1a1aa',
                  fontSize: 13,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!preview) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0f0d',
        padding: 24,
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
        
        {/* Back Button */}
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

        <View style={{
          width: 100,
          height: 100,
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          borderWidth: 2,
          borderColor: '#6b7280',
        }}>
          <Ionicons name="link-outline" size={48} color="#6b7280" />
        </View>
        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: 8,
        }}>
          No Preview Available
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#a1a1aa',
          textAlign: 'center',
          marginBottom: 32,
          paddingHorizontal: 20,
        }}>
          We couldn't fetch preview information for this URL. Please try a different link.
        </Text>
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            backgroundColor: 'rgba(0, 255, 148, 0.1)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#374151',
          }} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#00ff94" />
          <Text style={{
            marginLeft: 8,
            fontSize: 16,
            color: '#00ff94',
            fontWeight: '600',
          }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Back Button */}
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
        {/* Product Preview Card */}
        <View style={{ marginBottom: 24 }}>
          <UrlPreviewCard 
            preview={preview} 
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }} 
          />
        </View>

        {/* Product Details */}
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
            Product Details
          </Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}>
            <View style={{
              width: 32,
              height: 32,
              backgroundColor: '#1a2922',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="link" size={16} color="#00ff94" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: '#a1a1aa',
                fontSize: 12,
                fontWeight: '500',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Product URL
              </Text>
              <Text 
                style={{
                  color: '#d1d5db',
                  fontSize: 14,
                  lineHeight: 20,
                }} 
                numberOfLines={2}
              >
                {preview.url}
              </Text>
            </View>
          </View>
          
          {preview.description && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#1a2922',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="information-circle" size={16} color="#00e5ff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: '#a1a1aa',
                  fontSize: 12,
                  fontWeight: '500',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Description
                </Text>
                <Text 
                  style={{
                    color: '#d1d5db',
                    fontSize: 14,
                    lineHeight: 20,
                  }} 
                  numberOfLines={3}
                >
                  {preview.description}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 24 }}>
          {!showSuccess ? (
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                paddingHorizontal: 24,
                opacity: isAdding ? 0.7 : 1,
              }}
              onPress={handleAddToWishlist}
              disabled={isAdding}
              activeOpacity={0.8}
            >
              {isAdding ? (
                <View style={{
                  width: 18,
                  height: 18,
                  marginRight: 8,
                }}>
                  <LoadingSpinner size="small" />
                </View>
              ) : (
                <Ionicons name="heart" size={20} color="#000000" />
              )}
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: isAdding ? 0 : 8,
              }}>
                {isAdding ? 'Adding to Wishlist...' : 'Add to Wishlist'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              alignItems: 'center',
              padding: 40,
              backgroundColor: '#0f1b14',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#00ff94',
            }}>
              {/* Success Icon */}
              <View style={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(0, 255, 148, 0.15)',
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                borderWidth: 2,
                borderColor: '#00ff94',
              }}>
                <Ionicons name="checkmark-circle" size={44} color="#00ff94" />
              </View>
              
              {/* Success Message */}
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: 12,
                textAlign: 'center',
              }}>
                Added to Wishlist!
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#a1a1aa',
                marginBottom: 32,
                textAlign: 'center',
                lineHeight: 22,
                paddingHorizontal: 20,
              }}>
                Product successfully saved to your wishlist. Start saving money for it now!
              </Text>
              
              {/* Action Buttons */}
              <View style={{
                width: '100%',
                gap: 12,
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#00ff94',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                  }}
                  onPress={handleViewWishlist}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={18} color="#000000" />
                  <Text style={{
                    color: '#000000',
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}>
                    View My Wishlist
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: '#374151',
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#a1a1aa" />
                  <Text style={{
                    color: '#a1a1aa',
                    fontSize: 13,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}>
                    Add Another Product
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AddScreen;