import { browser } from 'wxt/browser';
import { emptySnapshot, isGooglePage, type Snapshot } from './verification';

// On explicit user action only. The injected function returns booleans, not page text or URLs.
export async function inspectActiveTab(): Promise<Snapshot> {
  const [tab] = await browser.tabs.query({active:true,currentWindow:true});
  if (!tab?.url || tab.id === undefined) return emptySnapshot();
  if (!isGooglePage(tab.url)) return {...emptySnapshot(),page:'other',checked:true};
  try {
    const [execution] = await browser.scripting.executeScript({
      target:{tabId:tab.id},
      func: () => {
        if (location.origin !== 'https://accounts.google.com') return null;
        const elements = Array.from(document.querySelectorAll<HTMLElement>('button,[role="button"],a'));
        const labels = elements.filter(e => e.getClientRects().length > 0 && getComputedStyle(e).visibility === 'visible' && !e.closest('[aria-hidden="true"],[hidden]'))
          .map(e => (e.innerText || e.getAttribute('aria-label') || '').trim().toLowerCase());
        return {
          qr: labels.some(t=> /\bqr\s*code\b|mã qr/i.test(t)),
          sms: labels.some(t=> /\bsms\b|text message|tin nhắn/i.test(t)),
          voice: labels.some(t=> /voice call|phone call|cuộc gọi/i.test(t)),
        };
      },
    });
    const result = execution?.result;
    if (!result) return {...emptySnapshot(),page:'google'};
    return {page:'google',checked:true,methods:{qr:result.qr?'visible':'not-visible',sms:result.sms?'visible':'not-visible',voice:result.voice?'visible':'not-visible'}};
  } catch { return {...emptySnapshot(),page:'google'}; }
}
