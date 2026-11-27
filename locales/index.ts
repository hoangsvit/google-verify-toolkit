import en from './en.json';
import vi from './vi.json';
import ja from './ja.json';
import zhCN from './zh-CN.json';
import ko from './ko.json';
export const dictionaries = { en, vi, ja, 'zh-CN':zhCN, ko } satisfies Record<string,Record<keyof typeof en,string>>;
export type Locale = keyof typeof dictionaries;
export type Language = Locale | 'auto';
export const locales = ['en','vi','ja','zh-CN','ko'] as const;
export const languageNames: Record<Locale,string> = {en:'English',vi:'Tiếng Việt',ja:'日本語','zh-CN':'简体中文',ko:'한국어'};
export function normalizeLanguage(value:unknown):Language {return typeof value==='string'&&locales.some(l=>l===value)?value as Locale:'auto';}
export function resolveLocale(value:Language, preferred:readonly string[]):Locale {
 if(value!=='auto')return value;
 for(const language of preferred){const base=language.toLowerCase().split('-')[0];if(base==='zh')return 'zh-CN';if(base==='en'||base==='vi'||base==='ja'||base==='ko')return base;}
 return 'en';
}
