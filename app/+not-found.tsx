import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.message}>This route doesn't exist.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go back to home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: Colors.textSub,
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});