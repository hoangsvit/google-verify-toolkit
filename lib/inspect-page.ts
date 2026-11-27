// Serialized by scripting.executeScript; keep this function self-contained.
export function inspectGoogleDocument() {
  if (location.origin !== 'https://accounts.google.com') return null;
  const visible = (element: HTMLElement) => element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility === 'visible' &&
    !element.closest('[aria-hidden="true"],[hidden],[inert]');
  const label = (element: HTMLElement) => [element.getAttribute('aria-label'), element.getAttribute('title'), element.getAttribute('alt'), element.innerText].filter(Boolean).join(' ').trim();
  const controls = Array.from(document.querySelectorAll<HTMLElement>('button,[role="button"],a,[role="link"]')).filter(e => visible(e) && !e.matches(':disabled,[aria-disabled="true"]'));
  const headings = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,[role="heading"],img,canvas,[role="img"]')).filter(visible);
  const qrPattern = /\bqr(?:\s*code)?\b|mã qr/i;
  return {
    qr: [...controls,...headings].some(e=>qrPattern.test(label(e))),
    sms: controls.some(e=>/\bsms\b|text message|tin nhắn/i.test(label(e))),
    voice: controls.some(e=>/voice call|phone call|cuộc gọi/i.test(label(e))),
    alternative: controls.some(e=>/try another way|try a different way|other ways|thử cách khác|thử một cách khác|cách khác/i.test(label(e))),
  };
}
