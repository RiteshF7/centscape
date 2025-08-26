import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UnmatchedRoute() {
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('🔗 Deep Link: Unmatched route accessed', { params });
    
    // Check if this is a deep link attempt
    if (params.url) {
      console.log('🔗 Deep Link: URL found in unmatched route, redirecting to addProduct', { url: params.url });
      router.replace({
        pathname: '/addProduct',
        params: { url: params.url as string }
      });
    }
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0f0d', padding: 20 }}>
      <View style={{
        backgroundColor: '#0f1b14',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#ef4444',
        alignItems: 'center',
      }}>
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
        
        <Text style={{
          fontSize: 20,
          color: '#ffffff',
          fontWeight: '700',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          Unmatched Route
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: '#a1a1aa',
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: 24,
        }}>
          This route doesn't exist. If you're testing a deep link, check the console for debugging information.
        </Text>
        
        <Text style={{
          fontSize: 14,
          color: '#00ff94',
          fontFamily: 'monospace',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          Params: {JSON.stringify(params, null, 2)}
        </Text>
        
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
          onPress={() => router.replace('/addURL')}
        >
          <Ionicons name="home" size={16} color="#000000" />
          <Text style={{
            color: '#000000',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
          }}>
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
