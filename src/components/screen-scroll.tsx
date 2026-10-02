import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenScrollProps = {
  children: ReactNode;
  withTabInset?: boolean;
};

export function ScreenScroll({ children, withTabInset = true }: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const topPadding = Platform.select({
    android: insets.top + Spacing.three,
    ios: Spacing.three,
    web: 88,
    default: Spacing.three,
  });

  const bottomPadding =
    (withTabInset ? BottomTabInset : 0) + insets.bottom + Spacing.four;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.inner, { paddingTop: topPadding }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
});