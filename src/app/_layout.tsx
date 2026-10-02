import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { QuizProvider } from '@/hooks/quiz-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QuizProvider>
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz' }} />
          <Stack.Screen name="result/[id]" options={{ title: 'Results' }} />
        </Stack>
        <AnimatedSplashOverlay />
      </QuizProvider>
    </ThemeProvider>
  );
}