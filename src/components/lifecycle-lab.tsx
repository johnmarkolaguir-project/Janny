import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LogEntry = {
  id: number;
  text: string;
  tone: 'brand' | 'success' | 'danger';
};

export function LifecycleLab() {
  const theme = useTheme();
  const [label, setLabel] = useState('Quiz Quest');
  const [clicks, setClicks] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const counter = useRef(0);

  const log = useCallback((text: string, tone: LogEntry['tone'] = 'brand') => {
    counter.current += 1;
    const entry: LogEntry = { id: counter.current, text, tone };
    setLogs((current) => [entry, ...current].slice(0, 7));
  }, []);

  useEffect(() => {
    log('Parent mounted: effect with [] ran once');
    return () => log('Parent cleanup: effect with [] ran on unmount');
  }, [log]);

  useEffect(() => {
    log(`Dependency changed: label is now "${label}"`);
  }, [label, log]);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.block}>
        <ThemedText type="smallBold">Live effect log</ThemedText>
        <View style={styles.logList}>
          {logs.map((entry) => (
            <ThemedText
              key={entry.id}
              type="small"
              style={{
                color:
                  entry.tone === 'success'
                    ? Palette.success
                    : entry.tone === 'danger'
                      ? Palette.danger
                      : Palette.brand,
              }}>
              {entry.text}
            </ThemedText>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <ThemedText type="small" themeColor="textSecondary">
          Change the value below to trigger a re-render and re-run the dependent effect.
        </ThemedText>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Effect dependency"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
        />
        <View style={styles.row}>
          <ActionButton label="Trigger render" onPress={() => setClicks((n) => n + 1)} />
          <ThemedText type="small" themeColor="textSecondary">
            {clicks} extra render
          </ThemedText>
        </View>
      </View>

      <View style={styles.block}>
        <ThemedText type="small" themeColor="textSecondary">
          Unmounting runs the cleanup functions, exactly like closing a screen.
        </ThemedText>
        <ActionButton
          tone={mounted ? 'danger' : 'success'}
          label={mounted ? 'Unmount child' : 'Mount child'}
          onPress={() => {
            setMounted((current) => !current);
            log(mounted ? 'Child removed from the tree' : 'Child added to the tree');
          }}
        />
        {mounted ? <LifecycleChild log={log} /> : null}
      </View>
    </ThemedView>
  );
}

function LifecycleChild({ log }: { log: (text: string, tone?: LogEntry['tone']) => void }) {
  useEffect(() => {
    log('Child mounted: first paint finished');
    const timer = setTimeout(() => log('Child timer fired while mounted', 'success'), 1500);
    return () => {
      clearTimeout(timer);
      log('Child unmounted: timer cleared in cleanup', 'danger');
    };
  }, [log]);

  return (
    <View style={styles.child}>
      <ThemedText type="smallBold">Child component</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        It owns a timer and always clears it on unmount.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  block: {
    gap: Spacing.two,
  },
  logList: {
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: Palette.brandSoft,
    minHeight: 92,
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.brand,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  child: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.brand,
  },
});