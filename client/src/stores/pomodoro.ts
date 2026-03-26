import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

interface CompletedSession {
  durationMinutes: number;
  timestamp: string;
  subjectId: string | null;
}

interface PomodoroState {
  isMinimized: boolean;
  currentMode: PomodoroMode;
  timeRemaining: number;
  isRunning: boolean;
  sessionCount: number;
  selectedSubjectId: string | null;
  settings: PomodoroSettings;
  completedSessions: CompletedSession[];

  // Actions
  toggleMinimized: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSubject: (subjectId: string | null) => void;
  tick: () => void;
  nextSession: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  logCompletedSession: () => void;
  getTotalStudyMinutes: () => number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

function getDuration(mode: PomodoroMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'work': return settings.workMinutes * 60;
    case 'shortBreak': return settings.shortBreakMinutes * 60;
    case 'longBreak': return settings.longBreakMinutes * 60;
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isMinimized: false,
      currentMode: 'work',
      timeRemaining: DEFAULT_SETTINGS.workMinutes * 60,
      isRunning: false,
      sessionCount: 0,
      selectedSubjectId: null,
      settings: DEFAULT_SETTINGS,
      completedSessions: [],

      toggleMinimized: () =>
        set((state) => ({ isMinimized: !state.isMinimized })),

      start: () => set({ isRunning: true }),

      pause: () => set({ isRunning: false }),

      reset: () =>
        set((state) => ({
          timeRemaining: getDuration(state.currentMode, state.settings),
          isRunning: false,
        })),

      setSubject: (selectedSubjectId) => set({ selectedSubjectId }),

      updateSettings: (newSettings) =>
        set((state) => {
          const merged = { ...state.settings, ...newSettings };
          // If not running, also update timeRemaining to reflect new duration
          if (!state.isRunning) {
            return {
              settings: merged,
              timeRemaining: getDuration(state.currentMode, merged),
            };
          }
          return { settings: merged };
        }),

      logCompletedSession: () => {
        const state = get();
        const session: CompletedSession = {
          durationMinutes: state.settings.workMinutes,
          timestamp: new Date().toISOString(),
          subjectId: state.selectedSubjectId,
        };
        set((s) => ({
          completedSessions: [...s.completedSessions, session],
        }));
      },

      getTotalStudyMinutes: () => {
        return get().completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      },

      tick: () =>
        set((state) => {
          if (state.timeRemaining > 0) {
            return { timeRemaining: state.timeRemaining - 1 };
          } else {
            // Session ended
            get().nextSession();
            return { timeRemaining: getDuration(get().currentMode, state.settings) };
          }
        }),

      nextSession: () =>
        set((state) => {
          if (state.currentMode === 'work') {
            const newSessionCount = state.sessionCount + 1;
            if (newSessionCount % 4 === 0) {
              return {
                currentMode: 'longBreak',
                timeRemaining: getDuration('longBreak', state.settings),
                sessionCount: newSessionCount,
                isRunning: false,
              };
            } else {
              return {
                currentMode: 'shortBreak',
                timeRemaining: getDuration('shortBreak', state.settings),
                sessionCount: newSessionCount,
                isRunning: false,
              };
            }
          } else {
            // Break ended, back to work
            return {
              currentMode: 'work',
              timeRemaining: getDuration('work', state.settings),
              isRunning: false,
            };
          }
        }),
    }),
    {
      name: 'pomodoro-storage',
      partialize: (state) => ({
        isMinimized: state.isMinimized,
        currentMode: state.currentMode,
        timeRemaining: state.timeRemaining,
        isRunning: state.isRunning,
        sessionCount: state.sessionCount,
        selectedSubjectId: state.selectedSubjectId,
        settings: state.settings,
        completedSessions: state.completedSessions,
      }),
    }
  )
);