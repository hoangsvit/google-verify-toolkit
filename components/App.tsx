import {useEffect,useRef,useState} from 'react';
import {ShieldCheck,Scan,MessageSquare,Phone,QrCode,Globe,Activity,Settings,Copy,ExternalLink,RefreshCw} from 'lucide-react';
import {browser} from 'wxt/browser';
import {Button} from './motion/button/base';
import {inspectActiveTab} from '../lib/inspect';
import {emptySnapshot,diagnosticReport,type Method} from '../lib/verification';
import type {Preferences} from '../lib/preferences';
import {usePreferences} from '../lib/use-preferences';
import {locales,languageNames} from '../locales';
import {ThemeToggle} from './motion/theme-toggle';

export function App({panel=false}:{panel?:boolean}){
 const {prefs,ready,t,update:save}=usePreferences();
 const [tab,setTab]=useState<'overview'|'diagnostics'|'settings'>('overview');
 const [snapshot,setSnapshot]=useState(emptySnapshot);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const scanVersion=useRef(0);
 useEffect(()=>{
  const reset=()=>{scanVersion.current++;setSnapshot(emptySnapshot());setBusy(false);setNotice('');};
  const onUpdate=(_id:number,change:{status?:string;url?:string},tab:{active?:boolean})=>{if(tab.active&&(change.status==='loading'||change.url))reset();};
  browser.tabs.onActivated.addListener(reset);
  browser.tabs.onUpdated.addListener(onUpdate);
  return ()=>{browser.tabs.onActivated.removeListener(reset);browser.tabs.onUpdated.removeListener(onUpdate);};
 },[]);
 async function update(next:Preferences){try{await save(next)}catch{setNotice(t.saveFail)}}
 async function scan(){const version=++scanVersion.current;setBusy(true);setNotice('');try{const result=await inspectActiveTab();if(version===scanVersion.current)setSnapshot(result)}catch{if(version===scanVersion.current)setSnapshot(emptySnapshot())}finally{if(version===scanVersion.current)setBusy(false)}}
 async function copy(){try{await navigator.clipboard.writeText(diagnosticReport(snapshot));setNotice(t.copied)}catch{setNotice(t.copyFail)}}
 const methods=[['qr',QrCode],['sms',MessageSquare],['voice',Phone]] as const;
 const status=(method:Method)=>snapshot.methods[method]==='visible'?t.visible:snapshot.methods[method]==='not-visible'?t.hidden:t.unknown;
 return <main className={(panel?"w-full":"w-[390px]")+" max-w-full min-h-[520px] p-4 flex flex-col gap-4"}>
  <header className="flex items-center gap-3"><div className="rounded-2xl bg-primary/15 p-3 text-primary"><ShieldCheck size={26}/></div><div className="flex-1"><h1 className="font-semibold text-base">Google Verify Toolkit</h1><p className="text-xs text-muted-foreground">{t.subtitle}</p></div><ThemeToggle theme={prefs.theme} disabled={!ready} labels={t} onChange={theme=>void update({...prefs,theme})}/></header>
  <nav aria-label={t.navigation} className="flex gap-1 rounded-2xl bg-muted p-1">{(['overview','diagnostics','settings'] as const).map(key=><Button key={key} variant={tab===key?'secondary':'ghost'} size="sm" aria-pressed={tab===key} className="flex-1 min-w-0 px-2" onClick={()=>{setTab(key);setNotice('')}}>{t[key]}</Button>)}</nav>
  {tab!=='settings'&&<><section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-2"><Globe className="text-primary" size={19}/><h2 className="text-sm font-medium">{t.current}</h2></div><p className="mt-2 text-sm">{snapshot.page==='google'?t.google:snapshot.page==='other'?t.other:t.unknown}</p><p className="mt-1 text-xs text-muted-foreground">{snapshot.page==='google'?'accounts.google.com':t.hint}</p></section>
  <section className="flex flex-col gap-2"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.methods}</h2>{methods.map(([key,Icon])=><div key={key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={19}/></div><div className="flex-1"><div className="text-sm font-medium">{t[key]}</div><p className="text-xs text-muted-foreground">{status(key)}</p></div></div>)}</section>
  <Button className="w-full" size="lg" disabled={busy} onClick={()=>void scan()}>{busy?<RefreshCw size={17} className="motion-safe:animate-spin"/>:<Scan size={17}/>} {busy?t.checking:snapshot.checked?t.refresh:t.check}</Button>
  {tab==='diagnostics'&&<section className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2"><div className="flex items-center gap-2 text-sm"><Activity size={16}/>{t.result}: {snapshot.checked?t.success:t.unavailable}</div><Button variant="outline" onClick={()=>void copy()}><Copy size={15}/>{t.copy}</Button></section>}
  <section className="rounded-xl border border-border bg-card p-3 space-y-2"><h2 className="text-sm font-medium">{t.guide_title}</h2><div className="flex justify-between gap-2 text-xs"><span>{t.guide_alt}</span><span className="text-muted-foreground">{snapshot.alternative==='visible'?t.guide_detected:snapshot.alternative==='not-visible'?t.guide_missing:t.guide_unknown}</span></div><p className="text-xs text-muted-foreground">{t.guide_steps}</p><p className="text-xs text-muted-foreground">{t.guide_qr}</p></section>
  {snapshot.page==='google'&&!snapshot.checked&&<p role="status" className="text-xs text-primary">{t.guide_permission}</p>}
  <p className="text-xs leading-relaxed text-muted-foreground">{t.hint}</p>{panel&&<p className="text-xs text-muted-foreground">{t.guide_side}</p>}</>}
  {tab==='settings'&&<section className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4"><h2 className="flex items-center gap-2 font-medium"><Settings size={17}/>{t.settings}</h2><label className="flex flex-col gap-2 text-sm">{t.theme}<select disabled={!ready} className="rounded-lg border border-border bg-background p-2" value={prefs.theme} onChange={e=>void update({...prefs,theme:e.target.value as Preferences['theme']})}>{(['system','light','dark'] as const).map(key=><option key={key} value={key}>{t[key]}</option>)}</select></label><label className="flex flex-col gap-2 text-sm">{t.language}<select className="rounded-lg border border-border bg-background p-2" value={prefs.language} onChange={e=>void update({...prefs,language:e.target.value as Preferences['language']})}><option value="auto">{t.autoLanguage}</option>{locales.map(locale=><option key={locale} value={locale}>{languageNames[locale]}</option>)}</select></label></section>}
  {notice&&<p role="status" className="text-xs text-primary">{notice}</p>}
  <footer className="mt-auto flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><p className="flex items-center gap-1"><ShieldCheck size={14}/>{t.privacy}</p><div className="flex justify-between"><button className="flex items-center gap-1" onClick={()=>void browser.tabs.create({url:'https://support.google.com/accounts/'})}>{t.help}<ExternalLink size={12}/></button><button className="flex items-center gap-1" onClick={()=>void browser.tabs.create({url:'https://github.com/hoangsvit/google-verify-toolkit'})}>GitHub<ExternalLink size={12}/></button><span>v{browser.runtime.getManifest().version}</span></div></footer>
 </main>;
}
