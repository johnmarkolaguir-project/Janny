import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { DIFFICULTY_LABEL } from '@/data/questions';
import { scorePercent, useQuiz } from '@/hooks/quiz-store';
import { useTheme } from '@/hooks/use-theme';

export default function ResultScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAttempt } = useQuiz();

  const attempt = getAttempt(id);

  if (!attempt) {
    return (
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <ThemedText type="subtitle">No result found</ThemedText>
          <ThemedText themeColor="textSecondary">
            That result link has expired. Play a round to create a new one.
          </ThemedText>
          <ActionButton full label="Back to quizzes" onPress={() => router.dismissAll()} />
        </View>
      </ScrollView>
    );
  }

  const percent = scorePercent(attempt);
  const headline = percent >= 80 ? 'Champion!' : percent >= 50 ? 'Nice run!' : 'Worth another try';

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}>
      <View style={styles.inner}>
        <ThemedView type="backgroundElement" style={styles.hero}>
          <ThemedText style={styles.heroEmoji}>{attempt.quizEmoji}</ThemedText>
          <ThemedText type="title" style={styles.heroTitle}>
            {percent}%
          </ThemedText>
          <ThemedText type="subtitle">{headline}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {attempt.name} finished {attempt.quizName} on {DIFFICULTY_LABEL[attempt.difficulty]} —
            {attempt.correct}/{attempt.total} correct for {attempt.score} points
          </ThemedText>
        </ThemedView>

        <View style={styles.review}>
          {attempt.answers.map((record, index) => {
            const isCorrect = record.picked === record.answer;
            return (
              <ThemedView key={`${record.prompt}-${index}`} type="backgroundElement" style={styles.reviewRow}>
                <View style={styles.reviewHeader}>
                  <ThemedText type="smallBold" style={styles.reviewPrompt}>
                    {index + 1}. {record.prompt}
                  </ThemedText>
                  <ThemedText
                    type="smallBold"
                    style={{ color: isCorrect ? Palette.success : Palette.danger }}>
                    {isCorrect ? 'Correct' : 'Missed'}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Your answer:{' '}
                  {record.picked === -1 ? 'No answer (time up)' : record.options[record.picked]}
                </ThemedText>
                {!isCorrect ? (
                  <ThemedText type="small" style={{ color: Palette.success }}>
                    Correct answer: {record.options[record.answer]}
                  </ThemedText>
                ) : null}
              </ThemedView>
            );
          })}
        </View>

        <ActionButton
          full
          tone="success"
          label="Play this round again"
          onPress={() =>
            router.replace({
              pathname: '/quiz/[id]',
              params: { id: attempt.quizId, difficulty: attempt.difficulty },
            })
          }
        />
        <ActionButton full tone="neutral" label="Back to quizzes" onPress={() => router.dismissAll()} />
      </View>
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
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 56,
    lineHeight: 60,
  },
  review: {
    gap: Spacing.two,
  },
  reviewRow: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.brand,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  reviewPrompt: {
    flex: 1,
  },
});