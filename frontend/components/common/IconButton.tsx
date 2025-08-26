import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  style?: ViewStyle;
  disabled?: boolean;
}

const getButtonSize = (size: IconButtonProps['size']) => {
  switch (size) {
    case 'small':
      return { width: 32, height: 32, iconSize: 16, borderRadius: 16 };
    case 'large':
      return { width: 56, height: 56, iconSize: 24, borderRadius: 28 };
    default:
      return { width: 40, height: 40, iconSize: 20, borderRadius: 20 };
  }
};

const getButtonColors = (variant: IconButtonProps['variant']) => {
  switch (variant) {
    case 'primary':
      return '#667eea';
    case 'secondary':
      return '#95a5a6';
    case 'success':
      return '#4CAF50';
    case 'danger':
      return '#e74c3c';
    default:
      return '#667eea';
  }
};

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'primary',
  style,
  disabled = false,
}) => {
  const buttonSize = getButtonSize(size);
  const backgroundColor = disabled ? '#ccc' : getButtonColors(variant);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize.width,
          height: buttonSize.height,
          borderRadius: buttonSize.borderRadius,
          backgroundColor,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={buttonSize.iconSize} 
        color="#ffffff" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default IconButton;
