export interface TransliterationState {
  input: string;
  output: string;
  isLoading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  original: string;
  transliterated: string;
  timestamp: number;
}
