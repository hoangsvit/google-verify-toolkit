export type Method = 'qr' | 'sms' | 'voice';
export type Status = 'unknown' | 'visible' | 'not-visible';
export type Snapshot = { page: 'google' | 'other' | 'unknown'; methods: Record<Method, Status>; checked: boolean };
export const emptySnapshot = (): Snapshot => ({page:'unknown',methods:{qr:'unknown',sms:'unknown',voice:'unknown'},checked:false});
export function isGooglePage(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'accounts.google.com' && !url.port && !url.username && !url.password;
  } catch { return false; }
}
export function diagnosticReport(snapshot: Snapshot): string {
  return JSON.stringify({ version: 1, page: snapshot.page, checked: snapshot.checked, methods: { qr:snapshot.methods.qr, sms:snapshot.methods.sms, voice:snapshot.methods.voice } }, null, 2);
}
