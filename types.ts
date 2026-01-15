
export enum Category {
  STEM = 'STEM',
  CULTURE = 'Local Culture',
  FESTIVALS = 'Festivals'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  streak: number;
  isGameOver: boolean;
  questions: Question[];
  selectedCategory: Category;
  selectedDifficulty: Difficulty;
  region: string;
}

export type Screen = 'HOME' | 'SETUP' | 'LOADING' | 'QUIZ' | 'RESULTS';
