import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ScreenScroll } from '@/components/screen-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { DIFFICULTY_LABEL } from '@/data/questions';
import { scorePercent, useQuiz } from '@/hooks/quiz-store';

export default function ScoresScreen() {
  const router = useRouter();
  const { attempts, clearAttempts } = useQuiz();

  const totalPoints = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const bestPercent = attempts.reduce(
    (best, attempt) => Math.max(best, scorePercent(attempt)),
    0
  );

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <ThemedText type="subtitle">Your scores</ThemedText>
        <ThemedText themeColor="textSecondary">
          Finished rounds live in the shared quiz store, so this tab always matches the result
          screen.
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.statsRow}>
        <Stat label="Rounds" value={String(attempts.length)} />
        <Stat label="Best" value={`${bestPercent}%`} />
        <Stat label="Points" value={String(totalPoints)} />
      </ThemedView>

      {attempts.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText style={styles.emptyEmoji}>{'\u{1F3AF}'}</ThemedText>
          <ThemedText type="subtitle">No rounds yet</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Open the Play tab, pick a topic and finish a round.
          </ThemedText>
          <ActionButton label="Start a quiz" onPress={() => router.navigate('/')} />
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {attempts.map((attempt) => (
            <ThemedView key={attempt.id} type="backgroundElement" style={styles.row}>
              <View style={styles.rowMain}>
                <ThemedText type="smallBold">
                  {attempt.quizEmoji} {attempt.quizName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {attempt.name} · {DIFFICULTY_LABEL[attempt.difficulty]} ·{' '}
                  {new Date(attempt.playedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>
              <View style={styles.rowScore}>
                <ThemedText type="smallBold" style={{ color: Palette.brand }}>
                  {attempt.correct}/{attempt.total}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {scorePercent(attempt)}%
                </ThemedText>
              </View>
            </ThemedView>
          ))}
          <ActionButton full tone="danger" label="Clear history" onPress={clearAttempts} />
        </View>
      )}
    </ScreenScroll>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  stat: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowMain: {
    flex: 1,
    gap: Spacing.one,
  },
  rowScore: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
});