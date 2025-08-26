import { UrlPreview, WishlistItem } from '@/types/wishlist';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface UrlPreviewCardProps {
  preview: UrlPreview | WishlistItem;
  style?: ViewStyle;
  onRemove?: (id: string) => void;
  showRemoveButton?: boolean;
}

export const UrlPreviewCard: React.FC<UrlPreviewCardProps> = ({ 
  preview, 
  style, 
  onRemove,
  showRemoveButton = false 
}) => {
  const hasImage = preview.image && preview.image.trim() !== '';
  const hasDescription = preview.description && preview.description.trim() !== '';
  const hasPrice = preview.price && preview.price.trim() !== '';
  const isWishlistItem = 'id' in preview && 'addedAt' in preview;
  const itemId = isWishlistItem ? preview.id : undefined;

  // Debug log to check price data
  console.log('🔍 UrlPreviewCard: Price debug', { 
    hasPrice, 
    price: preview.price, 
    title: preview.title,
    isWishlistItem,
    itemId
  });

  const handleRemove = () => {
    if (onRemove && itemId) {
      onRemove(itemId);
    }
  };

  return (
    <View style={[{
      backgroundColor: '#0f1b14',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#374151',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      position: 'relative',
    }, style]}>
      
      {/* Remove Button - Top Right */}
      {showRemoveButton && onRemove && itemId && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
          onPress={handleRemove}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={12} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={{
        flexDirection: 'row',
        padding: 12,
        paddingRight: showRemoveButton ? 40 : 12,
      }}>
        
        {/* Image Section */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#1a2922',
          marginRight: 12,
        }}>
          {hasImage ? (
            <Image
              source={{ uri: preview.image }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#1a2922',
            }}>
              <Ionicons name="image-outline" size={24} color="#00ff94" />
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={{
          flex: 1,
          justifyContent: 'space-between',
        }}>
          
          {/* Top Section - Title and Price */}
          <View>
            {/* Title */}
            <Text 
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: 6,
                lineHeight: 20,
              }} 
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {preview.title || 'Product Title'}
            </Text>

            {/* Price */}
            {hasPrice && (
              <View style={{
                backgroundColor: 'rgba(0, 255, 148, 0.15)',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                alignSelf: 'flex-start',
                borderWidth: 1,
                borderColor: 'rgba(0, 255, 148, 0.3)',
              }}>
                <Text style={{
                  color: '#00ff94',
                  fontSize: 14,
                  fontWeight: '700',
                }}>
                  {preview.price}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Section - Description and Metadata */}
          <View style={{
            marginTop: 8,
          }}>
            
            {/* Description */}
            {hasDescription && (
              <Text 
                style={{
                  fontSize: 12,
                  color: '#a1a1aa',
                  lineHeight: 16,
                  marginBottom: 6,
                }} 
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {preview.description}
              </Text>
            )}

            {/* Metadata Row */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              
              {/* URL */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                marginRight: 8,
              }}>
                <Ionicons name="link" size={10} color="#6b7280" />
                <Text 
                  style={{
                    fontSize: 10,
                    color: '#6b7280',
                    marginLeft: 4,
                    fontFamily: 'monospace',
                  }} 
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {preview.url}
                </Text>
              </View>

              {/* Date */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="calendar-outline" size={10} color="#6b7280" />
                <Text style={{
                  fontSize: 10,
                  color: '#6b7280',
                  marginLeft: 4,
                }}>
                  {isWishlistItem ? new Date(preview.addedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UrlPreviewCard;