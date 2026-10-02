import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ScreenScroll } from '@/components/screen-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import {
  countFor,
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  DIFFICULTY_POINTS,
  QUIZZES,
} from '@/data/questions';
import { scorePercent, useQuiz } from '@/hooks/quiz-store';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { playerName, difficulty, attempts, setPlayerName, setDifficulty } = useQuiz();
  const [nameError, setNameError] = useState(false);

  const gamesPlayed = attempts.length;
  const bestPercent = attempts.reduce((best, attempt) => Math.max(best, scorePercent(attempt)), 0);

  function startQuiz(quizId: string) {
    if (playerName.trim().length === 0) {
      setNameError(true);
      return;
    }
    setNameError(false);
    router.push({ pathname: '/quiz/[id]', params: { id: quizId, difficulty } });
  }

  return (
    <ScreenScroll>
      <View style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>
          Quiz Quest
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Pick a topic, choose the difficulty, and chase your best score.
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle">Player</ThemedText>

        <TextInput
          value={playerName}
          onChangeText={(value) => {
            setNameError(false);
            setPlayerName(value);
          }}
          placeholder="Type your name"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={18}
          returnKeyType="done"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: nameError ? Palette.danger : theme.background,
            },
          ]}
        />
        {nameError ? (
          <ThemedText type="small" style={{ color: Palette.danger }}>
            A name is needed before the quiz starts.
          </ThemedText>
        ) : null}

        <ThemedText type="smallBold" themeColor="textSecondary">
          DIFFICULTY
        </ThemedText>

        <View style={styles.chipRow}>
          {DIFFICULTIES.map((level) => {
            const selected = level === difficulty;
            return (
              <Pressable
                key={level}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setDifficulty(level)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: selected ? Palette.brand : 'transparent',
                    borderColor: selected ? Palette.brandDeep : theme.background,
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={{ color: selected ? '#ffffff' : theme.text }}>
                  {DIFFICULTY_LABEL[level]}
                </ThemedText>
                <ThemedText type="small" style={{ color: selected ? '#ffffffCC' : theme.textSecondary }}>
                  {DIFFICULTY_POINTS[level]} pts
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>

      {QUIZZES.map((quiz) => (
        <ThemedView key={quiz.id} type="backgroundElement" style={styles.quizRow}>
          <View style={styles.quizInfo}>
            <ThemedText type="smallBold">
              {quiz.emoji} {quiz.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {quiz.tagline} · {countFor(quiz.id, difficulty)} questions at this difficulty
            </ThemedText>
          </View>
          <ActionButton label="Play" onPress={() => startQuiz(quiz.id)} />
        </ThemedView>
      ))}

      <ThemedView type="backgroundElement" style={styles.statsRow}>
        <Stat label="Games" value={String(gamesPlayed)} />
        <Stat label="Best" value={`${bestPercent}%`} />
        <Stat label="Per question" value={`${DIFFICULTY_POINTS[difficulty]} pts`} />
      </ThemedView>
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
  hero: {
    gap: Spacing.two,
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 46,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  quizInfo: {
    flex: 1,
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
});