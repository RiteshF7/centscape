import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large',
  style 
}) => {
  return (
    <ActivityIndicator size={size} color="#00ff94" style={style} />
  );
};
