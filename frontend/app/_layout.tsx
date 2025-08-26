import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { configService } from '@/services/configService';

const RootLayout: React.FC = () => {
  useEffect(() => {
    // Initialize configuration when app starts
    const initConfig = async () => {
      try {
        await configService.initialize();
        console.log('✅ App: Configuration initialized successfully');
      } catch (error) {
        console.error('❌ App: Failed to initialize configuration', error);
      }
    };
    
    initConfig();
  }, []);
  return (
    <>
      <StatusBar style="light" backgroundColor="#0a0f0d" />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: '#0a0f0d',
          },
          headerStatusBarHeight: 0,
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            title: 'Configuration',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="config"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="addURL"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="addProduct"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen 
          name="wishlist"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
};

export default RootLayout;
