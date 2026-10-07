import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Footer() {
  const theme = useTheme();

  return (
    <ThemedView
      type="background"
      style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}
    >
      <ThemedText type="small" themeColor="textSecondary">
        Quiz Quest · Built with ❤️ by {"TEAM GC KA SOHO"}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    paddingVertical: Spacing.three,
  },
});
