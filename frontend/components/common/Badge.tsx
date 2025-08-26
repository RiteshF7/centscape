import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';

export interface BadgeProps {
  variant?: 'success' | 'accent' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'accent',
  children,
  text,
  size = 'md',
  style,
  textStyle
}) => {
  const badgeText = text || children;

  return (
    <View 
      style={[
        {
          backgroundColor: variant === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                          variant === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                          variant === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                          variant === 'info' ? 'rgba(59, 130, 246, 0.1)' :
                          'rgba(0, 255, 148, 0.1)',
          borderWidth: 1,
          borderColor: variant === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                      variant === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
                      variant === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                      variant === 'info' ? 'rgba(59, 130, 246, 0.2)' :
                      'rgba(0, 255, 148, 0.2)',
          borderRadius: 9999,
          paddingHorizontal: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
          paddingVertical: size === 'sm' ? 4 : size === 'lg' ? 8 : 4,
          alignSelf: 'flex-start',
        },
        style
      ]}
    >
      {typeof badgeText === 'string' ? (
        <Text 
          style={[
            {
              fontWeight: '500',
              color: variant === 'success' ? '#10b981' :
                     variant === 'warning' ? '#f59e0b' :
                     variant === 'error' ? '#ef4444' :
                     variant === 'info' ? '#3b82f6' :
                     '#00ff94',
              fontSize: size === 'sm' ? 10 : size === 'lg' ? 14 : 12,
            },
            textStyle
          ]}
        >
          {badgeText}
        </Text>
      ) : (
        badgeText
      )}
    </View>
  );
};

export default Badge;
