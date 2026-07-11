export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ha', label: 'HA' },
  { code: 'yo', label: 'YO' },
  { code: 'ig', label: 'IG' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

export interface ProblemItem {
  problem: string;
  solution: string;
}
export interface TitledItem {
  title: string;
  detail: string;
}
export interface StoryItem {
  quote: string;
  role: string;
}
