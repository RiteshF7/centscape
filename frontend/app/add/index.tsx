import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function AddRoute() {
  const { url } = useLocalSearchParams<{ url: string }>();

  useEffect(() => {
    console.log('🔗 Deep Link: Add route accessed', { url });
    
    if (url) {
      console.log('🔗 Deep Link: URL found, redirecting to addProduct', { url });
      // Redirect to addProduct with the URL parameter
      router.replace({
        pathname: '/addProduct',
        params: { url }
      });
    } else {
      console.log('🔗 Deep Link: No URL found, redirecting to addURL');
      // If no URL provided, go back to addURL screen
      router.replace('/addURL');
    }
  }, [url]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0f0d' }}>
      <Text style={{ color: '#ffffff', fontSize: 16, marginBottom: 10 }}>Processing deep link...</Text>
      <Text style={{ color: '#a1a1aa', fontSize: 14 }}>URL: {url || 'None'}</Text>
    </View>
  );
}
