import { browser } from 'wxt/browser';
import { emptySnapshot, isGooglePage, badgeFor, type Snapshot } from './verification';
import { inspectGoogleDocument } from './inspect-page';

export async function inspectActiveTab(): Promise<Snapshot> {
  const [tab] = await browser.tabs.query({active:true,currentWindow:true});
  if (!tab?.url || tab.id === undefined) return emptySnapshot();
  if (!isGooglePage(tab.url)) return {...emptySnapshot(),page:'other',checked:true};
  let snapshot: Snapshot = {...emptySnapshot(),page:'google'};
  try {
    const [execution] = await browser.scripting.executeScript({target:{tabId:tab.id},func:inspectGoogleDocument});
    const result=execution?.result;
    if(result) snapshot={page:'google',checked:true,signupQr:result.signupQr,alternative:result.alternative?'visible':'not-visible',methods:{qr:result.qr?'visible':'not-visible',sms:result.sms?'visible':'not-visible',voice:result.voice?'visible':'not-visible'}};
  } catch { return snapshot; }
  try {
    const current=await browser.tabs.get(tab.id);
    if(current.url!==tab.url) return emptySnapshot();
    const badge=badgeFor(snapshot);
    await browser.action.setBadgeText({tabId:tab.id,text:badge});
    if(badge) await browser.action.setBadgeBackgroundColor({tabId:tab.id,color:'#245dd8'});
  } catch { /* Badge support is optional. */ }
  return snapshot;
}
