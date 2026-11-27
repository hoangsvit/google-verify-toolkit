// Serialized by scripting.executeScript; keep this function self-contained.
export function inspectGoogleDocument() {
  if (location.origin !== 'https://accounts.google.com') return null;
  const visible = (element: HTMLElement) => element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility === 'visible' &&
    !element.closest('[aria-hidden="true"],[hidden],[inert]');
  const label = (element: HTMLElement) => [element.getAttribute('aria-label'), element.getAttribute('title'), element.getAttribute('alt'), element.innerText].filter(Boolean).join(' ').trim();
  const controls = Array.from(document.querySelectorAll<HTMLElement>('button,[role="button"],a,[role="link"]')).filter(e => visible(e) && !e.matches(':disabled,[aria-disabled="true"]'));
  const headings = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,[role="heading"],img,canvas,[role="img"]')).filter(visible);
  // The signup challenge can render its instructions in plain text instead of headings.
  const instructions = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,p,[role="heading"],div,span')).filter(e=>visible(e)&&e.childElementCount===0);
  const signupTitle = /xác minh một số thông tin trước khi tạo tài khoản|verify some information before (?:you )?creat(?:e|ing) (?:an?|your) account|verify your information before creating an account/i;
  const scanInstruction = /quét mã qr bằng điện thoại|scan (?:the|this|a) qr code (?:with|using) your phone|scan (?:the|this|a) qr code on your phone/i;
  const signupQr = [...headings,...instructions].some(e=>signupTitle.test(label(e))) &&
    [...headings,...instructions].some(e=>scanInstruction.test(label(e)));
  const qrPattern = /\bqr(?:\s*code)?\b|mã qr/i;
  return {
    qr: signupQr || [...controls,...headings].some(e=>qrPattern.test(label(e))),
    signupQr,
    sms: controls.some(e=>/\bsms\b|text message|tin nhắn/i.test(label(e))),
    voice: controls.some(e=>/voice call|phone call|cuộc gọi/i.test(label(e))),
    alternative: controls.some(e=>/try another way|try a different way|other ways|thử cách khác|thử một cách khác|cách khác/i.test(label(e))),
  };
}
