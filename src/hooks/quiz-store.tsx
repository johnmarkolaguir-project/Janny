import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import { DIFFICULTY_POINTS, getQuiz, type Difficulty } from '@/data/questions';

export type AnswerRecord = {
  prompt: string;
  options: string[];
  picked: number;
  answer: number;
};

export type Attempt = {
  id: string;
  name: string;
  quizId: string;
  quizName: string;
  quizEmoji: string;
  difficulty: Difficulty;
  correct: number;
  total: number;
  score: number;
  answers: AnswerRecord[];
  playedAt: number;
};

type QuizStore = {
  playerName: string;
  difficulty: Difficulty;
  attempts: Attempt[];
  setPlayerName: (name: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  recordAttempt: (input: {
    quizId: string;
    difficulty: Difficulty;
    answers: AnswerRecord[];
    name?: string;
  }) => Attempt;
  getAttempt: (attemptId: string) => Attempt | undefined;
  clearAttempts: () => void;
};

const QuizContext = createContext<QuizStore | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState('Player');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const recordAttempt = useCallback<QuizStore['recordAttempt']>(
    ({ quizId, difficulty: level, answers, name }) => {
      const quiz = getQuiz(quizId);
      const correct = answers.filter((item) => item.picked === item.answer).length;
      const attempt: Attempt = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: name?.trim() || playerName.trim() || 'Player',
        quizId: quiz.id,
        quizName: quiz.name,
        quizEmoji: quiz.emoji,
        difficulty: level,
        correct,
        total: answers.length,
        score: correct * DIFFICULTY_POINTS[level],
        answers,
        playedAt: Date.now(),
      };
      setAttempts((current) => [attempt, ...current]);
      return attempt;
    },
    [playerName]
  );

  const getAttempt = useCallback(
    (attemptId: string) => attempts.find((attempt) => attempt.id === attemptId),
    [attempts]
  );

  const clearAttempts = useCallback(() => setAttempts([]), []);

  const value = useMemo<QuizStore>(
    () => ({
      playerName,
      difficulty,
      attempts,
      setPlayerName,
      setDifficulty,
      recordAttempt,
      getAttempt,
      clearAttempts,
    }),
    [playerName, difficulty, attempts, recordAttempt, getAttempt, clearAttempts]
  );

  return <QuizContext value={value}>{children}</QuizContext>;
}

export function useQuiz() {
  const store = use(QuizContext);
  if (!store) {
    throw new Error('useQuiz must be used inside QuizProvider');
  }
  return store;
}

export function scorePercent(attempt: Attempt) {
  if (attempt.total === 0) return 0;
  return Math.round((attempt.correct / attempt.total) * 100);
}