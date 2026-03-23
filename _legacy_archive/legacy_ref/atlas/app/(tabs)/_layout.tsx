import { useColorScheme } from '@/components/useColorScheme';
import Colors, { radius, spacing } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type IconName = 'message-text' | 'draw' | 'microphone' | 'cog';

function TabBarIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <MaterialCommunityIcons name={name} size={28} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.base,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Speak',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="message-text" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: 'Board',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="draw" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transcribe"
        options={{
          title: 'Listen',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="microphone" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="cog" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="emotions"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background.card,
    borderRadius: 0,
    height: 72,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
    height: 56,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Fredoka_700Bold',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 48,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    backgroundColor: Colors.primary.soft,
  },
});
 
