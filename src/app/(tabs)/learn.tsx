import { StyleSheet, View } from 'react-native';

import { ApiRequestLab } from '@/components/api-request-lab';
import { LifecycleLab } from '@/components/lifecycle-lab';
import { ScreenScroll } from '@/components/screen-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function LearnScreen() {
  return (
    <ScreenScroll>
      <View style={styles.header}>
        <ThemedText type="subtitle">How this app works</ThemedText>
        <ThemedText themeColor="textSecondary">
          Four ideas that power every screen in Quiz Quest, with a demo you can poke at.
        </ThemedText>
      </View>

      <TheoryCard
        index="1"
        title="User input and interactive state"
        lines={[
          'useState holds the name you type, the difficulty chips and every answer you tap on the quiz screen.',
          'State lives next to the screen that owns it, so it resets to a clean quiz whenever a new round mounts.',
          'Derived values, like the running score, are computed during render instead of stored twice.',
        ]}
      />

      <TheoryCard
        index="2"
        title="Navigation with expo router"
        lines={[
          'Files in src/app are routes. The (tabs) group keeps the three tabs, and quiz/[id] plus result/[id] are stack screens.',
          'router.push opens a screen, router.replace swaps the current one, and router.dismissAll returns to the first tab.',
          'Native tabs on iOS and Android, a headless tab bar on web, all from the same layout file.',
        ]}
      />

      <TheoryCard
        index="3"
        title="Passing data between screens"
        lines={[
          'Small values travel in the URL: the Play tab sends id and difficulty to /quiz/[id], and the quiz sends the finished attempt id to /result/[id].',
          'The receiving screen reads them with useLocalSearchParams, which is why a result link survives a reload.',
          'Bigger shared data, like the player name and the score history, lives in the QuizProvider store so every screen reads the same source.',
        ]}
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">Component lifecycle, live</ThemedText>
        <LifecycleLab />
      </View>

      <TheoryCard
        index="4"
        title="Component lifecycle and effects"
        lines={[
          'Mount runs render, then effects. Changing state re-renders, and effects re-run only when their dependencies change.',
          'Every effect can return a cleanup function that runs before the next run and on unmount.',
          'The quiz timer below uses the same pattern: it schedules a tick and clears it as soon as the answer is locked or the screen goes away.',
        ]}
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">API request, live</ThemedText>
        <ApiRequestLab />
      </View>

      <TheoryCard
        index="5"
        title="API request lifecycle"
        lines={[
          'A screen never shows a spinner without a reason: it models idle, loading, success and error as one piece of state.',
          'A request that fails or resolves after the screen closes must not call setState, so it checks an AbortController and cancels on unmount.',
          'The quiz questions are bundled with the app, so the game still works with no connection at all.',
        ]}
      />
    </ScreenScroll>
  );
}

function TheoryCard({
  index,
  title,
  lines,
}: {
  index: string;
  title: string;
  lines: string[];
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="smallBold" style={styles.index}>
          {index}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          {title}
        </ThemedText>
      </View>
      {lines.map((line) => (
        <ThemedText key={line} type="small" themeColor="textSecondary">
          {line}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  index: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
    backgroundColor: '#3C87F7',
    color: '#ffffff',
  },
  cardTitle: {
    flex: 1,
  },
  section: {
    gap: Spacing.two,
  },
});