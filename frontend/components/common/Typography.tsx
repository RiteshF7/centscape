import React from 'react';
import { Text, TextStyle } from 'react-native';

export interface TypographyProps {
  variant?: 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body2' | 'caption' | 'overline' | 'subtitle';
  children?: React.ReactNode;
  text?: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  text,
  color = 'primary',
  weight,
  align = 'left',
  style,
  numberOfLines,
  ellipsizeMode
}) => {
  const textContent = text || children;

  return (
    <Text 
      style={[
        {
          color: color === 'primary' ? '#ffffff' : 
                 color === 'secondary' ? '#a1a1aa' : 
                 color === 'tertiary' ? '#6b7280' : 
                 color === 'accent' ? '#00ff94' : 
                 color === 'success' ? '#10b981' : 
                 color === 'warning' ? '#f59e0b' : 
                 color === 'error' ? '#ef4444' : '#ffffff',
          fontSize: variant === 'hero' ? 72 : 
                   variant === 'h1' ? 36 : 
                   variant === 'h2' ? 30 : 
                   variant === 'h3' ? 24 : 
                   variant === 'h4' ? 20 : 
                   variant === 'h5' ? 18 : 
                   variant === 'h6' ? 16 : 
                   variant === 'body' ? 16 : 
                   variant === 'body2' ? 14 : 
                   variant === 'caption' ? 12 : 
                   variant === 'overline' ? 12 : 
                   variant === 'subtitle' ? 20 : 16,
          fontWeight: variant === 'hero' || variant === 'h1' || variant === 'h2' ? 'bold' : 
                     variant === 'h3' || variant === 'h4' ? 'semibold' : 
                     variant === 'h5' || variant === 'h6' ? 'medium' : 'normal',
          textAlign: align,
        },
        style
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {textContent}
    </Text>
  );
};

export default Typography;
