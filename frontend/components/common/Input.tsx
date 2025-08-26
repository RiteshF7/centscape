import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  helper,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Prepare input styles
  const inputStyles: TextStyle[] = [];
  if (inputStyle) {
    inputStyles.push(inputStyle);
  }
  if (leftIcon) {
    inputStyles.push({ paddingLeft: 40 });
  }
  if (rightIcon) {
    inputStyles.push({ paddingRight: 40 });
  }

  return (
    <View style={containerStyle}>
      {label && (
        <Text 
          style={[
            {
              fontSize: 14,
              fontWeight: '500',
              color: '#ffffff',
              marginBottom: 8,
            },
            labelStyle
          ]}
        >
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: [{ translateY: -10 }],
            zIndex: 10,
          }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            {
              backgroundColor: '#111b17',
              borderWidth: 1,
              borderColor: isFocused ? '#00ff94' : error ? '#ef4444' : '#374151',
              borderRadius: 8,
              paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 16 : 16,
              paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
              color: '#ffffff',
              fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
            },
            inputStyles
          ]}
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: [{ translateY: -10 }],
            zIndex: 10,
          }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text 
          style={[
            {
              fontSize: 14,
              color: '#ef4444',
              marginTop: 4,
            },
            errorStyle
          ]}
        >
          {error}
        </Text>
      )}
      
      {helper && !error && (
        <Text 
          style={[
            {
              fontSize: 14,
              color: '#6b7280',
              marginTop: 4,
            },
            helperStyle
          ]}
        >
          {helper}
        </Text>
      )}
    </View>
  );
};

export default Input;
