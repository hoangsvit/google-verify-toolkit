import { browser } from 'wxt/browser';
export type Preferences = { theme: 'system' | 'light' | 'dark'; language: 'en' | 'vi' };
export const defaults: Preferences = {theme:'system',language:'en'};
export function normalizePreferences(value: unknown): Preferences {
  const p = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {theme:p.theme==='light'||p.theme==='dark'?p.theme:'system',language:p.language==='vi'?'vi':'en'};
}
export async function loadPreferences(): Promise<Preferences> {
  const {preferences} = await browser.storage.local.get('preferences');
  return normalizePreferences(preferences);
}
export async function savePreferences(value:Preferences) { await browser.storage.local.set({preferences:value}); }
