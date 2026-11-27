import { browser } from 'wxt/browser';
export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId,change)=>{
    if(change.status==='loading'||change.url) void browser.action.setBadgeText({tabId,text:''}).catch(()=>{});
  });
});
