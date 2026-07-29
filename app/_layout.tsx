import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TripProvider } from '../context/TripContenxt';

export default function RootLayout() {
  return (
    <TripProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: '#f8fbff',
          },
        }}
      />
    </TripProvider>
  );
}