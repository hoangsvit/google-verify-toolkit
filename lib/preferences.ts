import { browser } from 'wxt/browser';
export type Preferences = { theme: 'system' | 'light' | 'dark'; language: 'en' | 'vi' };
export const defaults: Preferences = {theme:'system',language:'en'};
export async function loadPreferences(): Promise<Preferences> {
  const {preferences:p} = await browser.storage.local.get('preferences');
  return {theme:p?.theme==='light'||p?.theme==='dark'?p.theme:'system',language:p?.language==='vi'?'vi':'en'};
}
export async function savePreferences(value:Preferences) { await browser.storage.local.set({preferences:value}); }
