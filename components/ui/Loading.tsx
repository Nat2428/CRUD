import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingProps {
  message?: string;
  overlay?: boolean;
}

export const Loading = ({ message = 'Loading...', overlay = false }: LoadingProps) => {
  const theme = useTheme();

  if (overlay) {
    return (
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderRadius: 12 }]}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          {message && (
            <Text variant="bodyLarge" style={{ marginTop: 12, color: theme.colors.onSurface }}>
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      {message && (
        <Text variant="bodyLarge" style={{ marginTop: 12, color: theme.colors.onSurface }}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
