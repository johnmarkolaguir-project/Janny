import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ScreenScroll } from '@/components/screen-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import {
  buildQuiz,
  DIFFICULTY_LABEL,
  getQuiz,
  isDifficulty,
  type Difficulty,
} from '@/data/questions';
import { useQuiz, type AnswerRecord } from '@/hooks/quiz-store';

const SECONDS: Record<Difficulty, number> = {
  easy: 20,
  medium: 15,
  hard: 12,
};

export default function QuizScreen() {
  const router = useRouter();
  const { recordAttempt } = useQuiz();
  const { id, difficulty: rawDifficulty } = useLocalSearchParams<{
    id: string;
    difficulty?: string;
  }>();

  const level: Difficulty = isDifficulty(rawDifficulty) ? rawDifficulty : 'easy';
  const quiz = getQuiz(id);
  const questions = useMemo(() => buildQuiz(id, level), [id, level]);
  const timePerQuestion = SECONDS[level];

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(timePerQuestion);

  const question = questions[step];
  const answered = picked !== null;
  const correctSoFar = answers.filter((record) => record.picked === record.answer).length;

  const commit = useCallback(
    (optionIndex: number) => {
      setPicked(optionIndex);
      setAnswers((current) => [
        ...current,
        {
          prompt: question.prompt,
          options: question.options,
          picked: optionIndex,
          answer: question.answer,
        },
      ]);
    },
    [question]
  );

  useEffect(() => {
    if (picked !== null) return;

    const timer = setTimeout(() => {
      if (secondsLeft <= 1) {
        commit(-1);
        return;
      }
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [commit, picked, secondsLeft]);

  function next() {
    if (!answered) return;

    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      setPicked(null);
      setSecondsLeft(timePerQuestion);
      return;
    }

    const attempt = recordAttempt({ quizId: id, difficulty: level, answers });
    router.replace({ pathname: '/result/[id]', params: { id: attempt.id } });
  }

  return (
    <ScreenScroll withTabInset={false}>
      <Stack.Screen options={{ title: quiz.name }} />

      <View style={styles.headerRow}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {quiz.emoji} {DIFFICULTY_LABEL[level].toUpperCase()}
        </ThemedText>
        <ThemedText type="smallBold">
          Question {step + 1} / {questions.length}
        </ThemedText>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${((step + (answered ? 1 : 0)) / questions.length) * 100}%`,
              backgroundColor: Palette.brand,
            },
          ]}
        />
      </View>

      <View style={styles.headerRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Running score {correctSoFar}
        </ThemedText>
        <ThemedText
          type="small"
          style={secondsLeft <= 5 ? { color: Palette.danger } : undefined}>
          {secondsLeft}s left
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle">{question.prompt}</ThemedText>

        <View style={styles.optionList}>
          {question.options.map((option, index) => {
            const isCorrect = index === question.answer;
            const isPicked = index === picked;
            const tone = !answered ? 'idle' : isCorrect ? 'correct' : isPicked ? 'wrong' : 'idle';

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                disabled={answered}
                onPress={() => commit(index)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: optionToneStyles[tone].background },
                  { borderColor: optionToneStyles[tone].border },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="default" style={styles.optionLabel}>
                  {option}
                </ThemedText>
                {tone === 'correct' ? (
                  <ThemedText type="smallBold" style={{ color: Palette.success }}>
                    Correct
                  </ThemedText>
                ) : null}
                {tone === 'wrong' ? (
                  <ThemedText type="smallBold" style={{ color: Palette.danger }}>
                    Missed
                  </ThemedText>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {picked === -1 ? (
          <ThemedText type="small" style={{ color: Palette.danger }}>
            Time is up, moving on with a miss.
          </ThemedText>
        ) : null}
      </ThemedView>

      <ActionButton
        full
        label={step === questions.length - 1 ? 'See results' : 'Next question'}
        onPress={next}
        disabled={!answered}
      />

      <ActionButton full tone="neutral" label="Quit round" onPress={() => router.dismissAll()} />
    </ScreenScroll>
  );
}

const optionToneStyles = {
  idle: { background: 'transparent', border: 'transparent' },
  correct: { background: Palette.successSoft, border: Palette.success },
  wrong: { background: Palette.dangerSoft, border: Palette.danger },
} as const;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.brandSoft,
    overflow: 'hidden',
  },
  trackFill: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  optionList: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  optionLabel: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});