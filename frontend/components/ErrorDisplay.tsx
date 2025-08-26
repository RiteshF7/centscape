import { STYLES, TEXT } from '@/constants';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

interface Styles {
  container: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{TEXT.RETRY}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: STYLES.LAYOUT.CENTER,
    alignItems: STYLES.LAYOUT.CENTER,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: STYLES.COLORS.WHITE,
    fontSize: 16,
    fontWeight: STYLES.FONTS.WEIGHT_BOLD,
  },
});
