export const LOCALES = ['en', 'zh', 'ja', 'vi', 'th', 'ru', 'mn'] as const;
export type Locale = typeof LOCALES[number];

export function isLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

export const LANG_LABELS: Record<Locale, string> = {
  en: 'EN', zh: '中文', ja: '日本語', vi: 'Việt', th: 'ไทย', ru: 'RU', mn: 'MN',
};
