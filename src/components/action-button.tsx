import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';

type ActionButtonProps = PressableProps & {
  label: string;
  tone?: 'primary' | 'neutral' | 'danger' | 'success';
  full?: boolean;
};

export function ActionButton({
  label,
  tone = 'primary',
  full = false,
  disabled,
  style,
  ...rest
}: ActionButtonProps) {
  const toneStyle = toneStyles[tone];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.base,
        full && styles.full,
        { backgroundColor: toneStyle.background, borderColor: toneStyle.border },
        disabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <ThemedText type="smallBold" style={{ color: toneStyle.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const toneStyles = {
  primary: { background: Palette.brand, border: Palette.brandDeep, text: '#ffffff' },
  success: { background: Palette.success, border: Palette.success, text: '#ffffff' },
  danger: { background: Palette.dangerSoft, border: Palette.danger, text: Palette.danger },
  neutral: { background: 'transparent', border: '#8E8E9399', text: '#8E8E93' },
} as const;

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
  },
});