import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  text?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  text,
  style,
  textStyle,
  fullWidth = false,
  icon,
  iconPosition = 'left'
}) => {
  const buttonText = text || children;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: variant === 'primary' ? '#00ff94' : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: '#374151',
          paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
          paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#000000' : '#00ff94'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={{ marginRight: 8 }}>{icon}</Text>
          )}
          {typeof buttonText === 'string' ? (
            <Text 
              style={[
                {
                  fontWeight: '500',
                  color: variant === 'primary' ? '#000000' : '#ffffff',
                  fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
                },
                textStyle
              ]}
            >
              {buttonText}
            </Text>
          ) : (
            buttonText
          )}
          {icon && iconPosition === 'right' && (
            <Text style={{ marginLeft: 8 }}>{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
