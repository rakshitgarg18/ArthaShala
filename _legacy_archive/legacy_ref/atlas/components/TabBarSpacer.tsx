import { tabBarSpacerHeight } from '@/constants/Layout';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TabBarSpacer() {
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  spacer: {
    height: tabBarSpacerHeight,
  },
});
 
