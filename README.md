# Quiz Quest

A cross-platform quiz app built with **Expo (SDK 57)**, **Expo Router** and **TypeScript**. Pick a topic, choose a difficulty, answer five timed questions and chase your best score — on iOS, Android and the web.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)
- [Project structure](#project-structure)
- [API](#api)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [License](#license)

## Features

- **5 quiz categories** — Science Lab, History Hall, Deep Space, Geo Dash and Wild Planet.
- **3 difficulty levels** — Easy (10 pts), Medium (20 pts), Hard (30 pts), each with its own per-question timer (20s / 15s / 12s).
- **Per-question countdown** — running out of time counts as a miss and the round moves on.
- **Full answer review** — the result screen shows every question, your answer and the correct one.
- **Score history** — rounds, best percentage and total points, with a "clear history" option.
- **Player profile** — a name you type once is stored in the shared store and reused on every attempt.
- **Light & dark mode** — follows the system color scheme on every platform.
- **Works offline** — quiz questions ship inside the app; only the optional Learn-tab demo needs a network.
- **Educational "Learn" tab** — live demos of component lifecycle and a real API request with idle/loading/success/error states.

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Framework | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) (React Native 0.86, React 19) |
| Routing   | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, typed routes) |
| Language  | TypeScript (strict mode) |
| Animation | `react-native-reanimated` + `react-native-worklets` |
| Tabs      | Native tabs on iOS/Android, headless tab bar on web |
| Linting   | ESLint (`eslint-config-expo`) |

## Setup

### Prerequisites

- **Node.js** 20 or newer
- **npm** (the repo ships a `package-lock.json`)
- For native runs: the [Expo Go](https://expo.dev/go) app on your phone, or an iOS Simulator / Android emulator

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npx expo start
```

From the terminal output you can open the app in:

- a **development build** — https://docs.expo.dev/develop/development-builds/introduction/
- the **Android emulator** — https://docs.expo.dev/workflow/android-studio-emulator/
- the **iOS simulator** — https://docs.expo.dev/workflow/ios-simulator/
- **Expo Go** by scanning the QR code — https://expo.dev/go
- the **web** by pressing `w`

### 3. Verify the code (optional)

```bash
npm run lint      # ESLint
npx tsc --noEmit  # type-check
```

## Usage

The app has three tabs and two stack screens.

### Play tab (`/`)

1. Type your **name** (required — the Play button validates it).
2. Pick a **difficulty** chip: Easy / Medium / Hard. Each chip shows the points per question.
3. Choose one of the five quizzes. Each row shows how many questions exist at the selected difficulty.
4. Press **Play** to open `/quiz/[id]?difficulty=<level>`.

### Quiz screen (`/quiz/[id]`)

- 5 questions per round, shuffled from the bundled question bank.
- A countdown timer runs per question; at 0s the answer is locked as a miss.
- Tapping an option immediately locks it and highlights **Correct** / **Missed**.
- **Next question** advances; on the last question it becomes **See results**.
- **Quit round** returns to the first tab without recording anything.

### Result screen (`/result/[id]`)

- Shows your percentage, a headline (Champion! / Nice run! / Worth another try), correct count and points.
- Reviews every question with your answer and the correct answer.
- **Play this round again** restarts the same quiz at the same difficulty.

### Scores tab (`/scores`)

- Lists every finished round (quiz, player, difficulty, time, score, percentage).
- Summary row: rounds played, best percentage, total points.
- **Clear history** empties the store.

### Learn tab (`/learn`)

- Explains the five ideas behind the app (state, navigation, passing data, lifecycle, API requests) with two interactive demos: a lifecycle logger and a live API fetch.

State (name, difficulty, attempt history) lives in a `QuizProvider` context and survives navigation, but **not** a full app reload — history is in-memory only.

## Project structure

```
.
├── app.json                  # Expo config (name, icons, splash, plugins, experiments)
├── assets/                   # images, icons, splash assets
├── scripts/
│   └── reset-project.js      # moves starter code aside for a fresh start
└── src/
    ├── app/                  # routes — every file is a screen
    │   ├── _layout.tsx       # root stack: QuizProvider + theme + splash overlay
    │   ├── (tabs)/
    │   │   ├── _layout.tsx   # tab navigator (Play, Scores, Learn)
    │   │   ├── index.tsx     # Play screen
    │   │   ├── scores.tsx    # score history
    │   │   └── learn.tsx     # theory + live demos
    │   ├── quiz/[id].tsx     # quiz runner with timer
    │   └── result/[id].tsx   # answer review + score
    ├── components/           # reusable UI (buttons, themed text/view, tabs, labs)
    ├── constants/            # theme spacing/colors, brand palette
    ├── data/questions.ts     # question bank + quiz builder
    ├── hooks/
    │   ├── quiz-store.tsx    # shared QuizProvider / useQuiz store
    │   └── use-theme.ts      # current theme values
    └── global.css            # web/global styles
```

Path alias: `@/` maps to `src/` (and `@/assets/` to `assets/`) — see `tsconfig.json`.

## API

### External: Open Trivia Database

The Learn tab's **Live request** demo calls a public REST endpoint:

```
GET https://opentdb.com/api.php?amount=1&type=multiple
```

Response shape used by the app (`src/components/api-request-lab.tsx`):

```jsonc
{
  "response_code": 0,
  "results": [
    {
      "question": "Which ...?",
      "category": "General Knowledge",
      "difficulty": "easy",
      "correct_answer": "...",
      "incorrect_answers": ["...", "...", "..."]
    }
  ]
}
```

Details:

- Requests are cancelled with an `AbortController` on unmount or when a new fetch starts, so a late response never calls `setState`.
- The state machine is a single discriminated union: `idle | loading | success | error` (success also records elapsed ms).
- HTML entities in the payload are decoded client-side (`&quot;`, `&#039;`, `&amp;`, `&lt;`, `&gt;`).
- **The game itself never depends on this endpoint** — all quiz questions are bundled in `src/data/questions.ts`.

### Internal API

**`src/data/questions.ts`**

```ts
type Difficulty = 'easy' | 'medium' | 'hard';
type Question = { id; categoryId; difficulty; prompt; options: string[]; answer: number };
type Quiz = { id; name; tagline; emoji; categoryId };

getQuiz(quizId): Quiz
buildQuiz(quizId, difficulty, count = 5): Question[]
countFor(quizId, difficulty): number
isDifficulty(value): value is Difficulty
shuffle<T>(items): T[]

DIFFICULTIES: Difficulty[]
DIFFICULTY_LABEL: Record<Difficulty, string>
DIFFICULTY_POINTS: Record<Difficulty, number>
QUIZ_LENGTH = 5
QUIZZES: Quiz[]
```

**`src/hooks/quiz-store.tsx`**

```ts
<QuizProvider>
useQuiz(): {
  playerName: string;
  difficulty: Difficulty;
  attempts: Attempt[];
  setPlayerName(name): void;
  setDifficulty(level): void;
  recordAttempt({ quizId, difficulty, answers, name? }): Attempt;
  getAttempt(attemptId): Attempt | undefined;
  clearAttempts(): void;
}

scorePercent(attempt): number

type Attempt = {
  id; name; quizId; quizName; quizEmoji;
  difficulty; correct; total; score;
  answers: AnswerRecord[];
  playedAt: number;
};
```

`useQuiz()` throws outside `QuizProvider`.

### Routes

| Route            | Params               | Purpose |
|------------------|----------------------|---------|
| `/`              | —                    | Play tab: player name, difficulty, quiz list |
| `/scores`        | —                    | Score history |
| `/learn`         | —                    | Theory + interactive demos |
| `/quiz/[id]`     | `id`, `difficulty`   | Quiz runner |
| `/result/[id]`   | `id` (attempt id)    | Answer review |

Typed routes are enabled (`experiments.typedRoutes`), so route strings are checked by TypeScript.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `npx expo start` | Start the Metro dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start on the web |
| `npm run lint` | Run ESLint via `expo lint` |
| `npx tsc --noEmit` | Type-check |
| `npm run reset-project` | Move starter code to `app-example/` and scaffold a blank app |

## Configuration

All app configuration lives in `app.json`:

- `name`: **Quiz Quest**, `slug`: `Janny`, `scheme`: `janny` (deep links use `janny://`)
- Portrait-only orientation, automatic (light/dark) UI style
- Splash screen and per-platform icons/adaptive icons under `assets/`
- Plugins: `expo-router`, `expo-splash-screen`
- Experiments: `typedRoutes`, `reactCompiler`

`ios/` and `android/` directories are generated (Continuous Native Generation) — never edit them by hand.

## License

[MIT](./LICENSE)
