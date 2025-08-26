import { STORAGE_KEYS } from '@/constants';
import { UrlPreview, UseWishlistReturn, WishlistItem } from '@/types/wishlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const useWishlist = (): UseWishlistReturn => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID for wishlist items
  const generateId = useCallback((): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load wishlist from storage
  const loadWishlist = useCallback(async () => {
    console.log('📂 useWishlist: Loading wishlist from storage');
    try {
      setLoading(true);
      setError(null);
      
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST);
      console.log('📂 useWishlist: Raw stored data length:', stored ? stored.length : 0);
      
      if (stored) {
        const parsedItems: WishlistItem[] = JSON.parse(stored);
        
        // Migrate existing items to ensure they have the price field
        const migratedItems = parsedItems.map(item => ({
          ...item,
          price: item.price || undefined, // Ensure price field exists
        }));
        
        console.log('✅ useWishlist: Successfully loaded', { 
          itemCount: migratedItems.length,
          items: migratedItems.map(item => ({
            id: item.id,
            title: item.title,
            hasPrice: !!item.price,
            price: item.price,
            hasDescription: !!item.description,
            hasImage: !!item.image
          }))
        });
        setItems(migratedItems);
      } else {
        console.log('📂 useWishlist: No stored data found, initializing empty wishlist');
        setItems([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wishlist';
      console.error('❌ useWishlist: Error loading wishlist', { 
        error: errorMessage,
        errorType: err.constructor.name 
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save wishlist to storage
  const saveWishlist = useCallback(async (newItems: WishlistItem[]) => {
    console.log('💾 useWishlist: Saving wishlist to storage', { itemCount: newItems.length });
    try {
      const jsonString = JSON.stringify(newItems);
      console.log('💾 useWishlist: JSON string length:', jsonString.length);
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, jsonString);
      console.log('✅ useWishlist: Successfully saved to AsyncStorage');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save wishlist';
      console.error('❌ useWishlist: Error saving wishlist', { 
        error: errorMessage,
        errorType: err.constructor.name,
        itemCount: newItems.length 
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Add item to wishlist
  const addItem = useCallback(async (preview: UrlPreview) => {
    console.log('➕ useWishlist: Adding item to wishlist', { 
      title: preview.title,
      url: preview.url,
      hasImage: !!preview.image,
      hasPrice: !!preview.price,
      price: preview.price
    });
    
    try {
      setError(null);
      
      // Check if URL already exists
      const existingItem = items.find(item => item.url === preview.url);
      if (existingItem) {
        console.log('❌ useWishlist: Item already exists in wishlist', { 
          existingId: existingItem.id,
          title: existingItem.title 
        });
        throw new Error('This item is already in your wishlist');
      }

      const newItem: WishlistItem = {
        id: generateId(),
        url: preview.url,
        title: preview.title,
        description: preview.description,
        image: preview.image,
        price: preview.price,
        addedAt: new Date().toISOString(),
      };

      console.log('➕ useWishlist: Created new wishlist item', { 
        id: newItem.id,
        title: newItem.title,
        hasPrice: !!newItem.price,
        price: newItem.price,
        addedAt: newItem.addedAt 
      });

      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      await saveWishlist(updatedItems);
      
      console.log('✅ useWishlist: Successfully added item to wishlist');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to wishlist';
      console.error('❌ useWishlist: Error adding item', { 
        error: errorMessage,
        errorType: err.constructor.name 
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [items, generateId, saveWishlist]);

  // Remove item from wishlist
  const removeItem = useCallback(async (id: string) => {
    console.log('🗑️ useWishlist: Removing item from wishlist', { id, currentItemCount: items.length });
    
    try {
      setError(null);
      
      const itemToRemove = items.find(item => item.id === id);
      if (!itemToRemove) {
        console.log('❌ useWishlist: Item not found for removal', { id });
        throw new Error('Item not found in wishlist');
      }
      
      console.log('🗑️ useWishlist: Found item to remove', { 
        id: itemToRemove.id,
        title: itemToRemove.title 
      });
      
      const updatedItems = items.filter(item => item.id !== id);
      console.log('🗑️ useWishlist: Filtered items', { 
        beforeCount: items.length,
        afterCount: updatedItems.length 
      });
      
      setItems(updatedItems);
      await saveWishlist(updatedItems);
      
      console.log('✅ useWishlist: Successfully removed item from wishlist');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from wishlist';
      console.error('❌ useWishlist: Error removing item', { 
        error: errorMessage,
        errorType: err.constructor.name,
        id 
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [items, saveWishlist]);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return {
    items,
    addItem,
    removeItem,
    loading,
    error,
  };
};
