import { useWishlist } from '@/hooks/useWishlist';
import { UrlPreviewCard } from '@/components/UrlPreviewCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

const WishlistScreen: React.FC = () => {
  const { items, removeItem, loading } = useWishlist();

  const handleBack = () => {
    router.back();
  };

  const handleAddMore = () => {
    router.back();
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find(item => item.id === id);
    const title = item?.title || 'this item';
    
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${title}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeItem(id).catch(error => {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from wishlist');
            });
          },
        },
      ]
    );
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => {
      if (item.price) {
        const priceStr = item.price.replace(/[^0-9.]/g, '');
        const price = parseFloat(priceStr);
        return total + (isNaN(price) ? 0 : price);
      }
      return total;
    }, 0);
  };

  const totalValue = getTotalValue();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f0d', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 3,
          borderColor: '#00ff94',
          borderTopColor: 'transparent',
        }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f0d' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Header */}
      <View style={{
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#0a0f0d',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
      }}>
        {/* Back Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
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
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#00ff94" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: '#ffffff',
          textAlign: 'center',
          marginTop: 10,
        }}>
          My Wishlist
        </Text>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 20,
          paddingHorizontal: 20,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#00ff94' }}>
              {items.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
              Items
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#00e5ff' }}>
              ${totalValue.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
              Total Value
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          // Empty State
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
          }}>
            <View style={{
              width: 120,
              height: 120,
              backgroundColor: 'rgba(0, 255, 148, 0.1)',
              borderRadius: 60,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#00ff94',
              marginBottom: 24,
            }}>
              <Ionicons name="heart-outline" size={48} color="#00ff94" />
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Your Wishlist is Empty
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#a1a1aa',
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 22,
              paddingHorizontal: 20,
            }}>
              Start adding products you love and track your savings goals
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                paddingHorizontal: 32,
                shadowColor: '#00ff94',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={handleAddMore}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color="#000000" />
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Add Your First Product
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Wishlist Items
          <View>
            {items.map((item) => (
              <View key={item.id} style={{ marginBottom: 16 }}>
                <UrlPreviewCard 
                  preview={item} 
                  showRemoveButton={true}
                  onRemove={handleRemoveItem}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    shadowColor: 'transparent',
                  }} 
                />
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#00ff94',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                paddingHorizontal: 24,
                marginTop: 8,
                shadowColor: '#00ff94',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={handleAddMore}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#000000" />
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Add More Products
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WishlistScreen;