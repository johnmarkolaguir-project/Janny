import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';

type RemoteQuestion = {
  question: string;
  category: string;
  difficulty: string;
  correct: string;
};

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: RemoteQuestion; elapsed: number }
  | { status: 'error'; message: string };

const ENDPOINT = 'https://opentdb.com/api.php?amount=1&type=multiple';

export function ApiRequestLab() {
  const [state, setState] = useState<RequestState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading' });
    const startedAt = Date.now();

    try {
      const response = await fetch(ENDPOINT, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Server replied with ${response.status}`);
      }

      const payload = await response.json();
      const first = payload?.results?.[0];
      if (!first) {
        throw new Error('The server returned no questions');
      }

      setState({
        status: 'success',
        elapsed: Date.now() - startedAt,
        data: {
          question: decodeEntities(first.question),
          category: decodeEntities(first.category),
          difficulty: first.difficulty,
          correct: decodeEntities(first.correct_answer),
        },
      });
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ status: 'idle' });
        return;
      }
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold">Live request</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {state.status === 'success' ? `${state.elapsed}ms` : state.status}
        </ThemedText>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        One button, one request, and the four states any screen needs: idle, loading, success and
        error.
      </ThemedText>

      <ActionButton
        full
        tone="primary"
        label={state.status === 'loading' ? 'Fetching...' : 'Fetch a random question'}
        disabled={state.status === 'loading'}
        onPress={load}
      />

      {state.status === 'success' ? (
        <View style={[styles.result, { borderColor: Palette.success }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {state.data.category} · {state.data.difficulty}
          </ThemedText>
          <ThemedText type="smallBold">{state.data.question}</ThemedText>
          <ThemedText type="small" style={{ color: Palette.success }}>
            Answer: {state.data.correct}
          </ThemedText>
        </View>
      ) : null}

      {state.status === 'error' ? (
        <View style={[styles.result, { borderColor: Palette.danger }]}>
          <ThemedText type="small" style={{ color: Palette.danger }}>
            {state.message}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            The quiz still works offline because its questions ship inside the app.
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

function decodeEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  result: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
});