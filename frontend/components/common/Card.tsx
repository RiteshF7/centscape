import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface CardProps {
  variant?: 'default' | 'feature' | 'stats';
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean;
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
  padding = 'md',
  shadow = true,
  border = true
}) => {
  return (
    <View 
      style={[
        {
          backgroundColor: '#0f1b14',
          borderWidth: border ? 1 : 0,
          borderColor: '#374151',
          borderRadius: 12,
          padding: padding === 'sm' ? 12 : padding === 'lg' ? 24 : padding === 'xl' ? 32 : 24,
          shadowColor: shadow ? '#000' : 'transparent',
          shadowOffset: shadow ? { width: 0, height: 4 } : { width: 0, height: 0 },
          shadowOpacity: shadow ? 0.1 : 0,
          shadowRadius: shadow ? 8 : 0,
          elevation: shadow ? 4 : 0,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
