import {useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {FlaskConical,QrCode,MessageSquare,Phone,CheckCircle2,RotateCcw} from 'lucide-react';
import {Button} from './motion/button/base';
import {ThemeToggle} from './motion/theme-toggle';
import {usePreferences} from '../lib/use-preferences';
import {sandboxWords} from '../locales/sandbox';
import {advance,initialDemo,remaining,mockCode,FIXTURE_QR,FIXTURE_PHONE,OTP_TTL,RESEND_DELAY,type Event,type Channel,type ErrorKey} from '../lib/sandbox';

export function Sandbox(){
 const {prefs,ready,locale,t:common,update}=usePreferences();
 const t=sandboxWords[locale];
 const [demo,setDemo]=useState(initialDemo);
 const [channel,setChannel]=useState<Channel>('sms');
 const [entry,setEntry]=useState('');
 const [error,setError]=useState<ErrorKey|'qrError'|null>(null);
 const [now,setNow]=useState(Date.now);
 const [qrReady,setQrReady]=useState(false);
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  if(demo.step!=='qr')return;
  let active=true;setQrReady(false);
  if(canvas.current)void QRCode.toCanvas(canvas.current,FIXTURE_QR,{width:216,margin:4}).then(()=>{if(active)setQrReady(true)}).catch(()=>{if(active)setError('qrError')});
  return ()=>{active=false};
 },[demo.step]);
 useEffect(()=>{if(demo.step!=='otp')return;const timer=setInterval(()=>setNow(Date.now()),500);return ()=>clearInterval(timer)},[demo.step]);
 function dispatch(event:Event){
  const result=advance(demo,event);setDemo(result.state);setError(result.error??null);setNow(Date.now());
  if(event.type==='send'||event.type==='resend'||event.type==='reset')setEntry('');
 }
 function scan(){
  const c=canvas.current;const ctx=c?.getContext('2d');
  if(!c||!ctx){setError('qrError');return;}
  const pixels=ctx.getImageData(0,0,c.width,c.height);
  const result=jsQR(pixels.data,pixels.width,pixels.height);
  if(!result){setError('qrError');return;}
  dispatch({type:'scan',payload:result.data});
 }
 const step=demo.step==='qr'?1:demo.step==='method'?2:demo.step==='otp'?3:4;
 return <main className="mx-auto max-w-xl p-5 flex flex-col gap-4">
  <header className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-3"><FlaskConical size={26}/></div><div className="flex-1"><h1 className="text-xl font-semibold">{t.title}</h1><p className="text-xs text-muted-foreground">{t.intro}</p></div><ThemeToggle theme={prefs.theme} disabled={!ready} labels={common} onChange={theme=>void update({...prefs,theme}).catch(()=>{})}/></header>
  <div className="flex gap-2" aria-label={t.step+' '+step+' / 4'}>{[1,2,3,4].map(n=><div key={n} className={'h-1.5 flex-1 rounded-full '+(n<=step?'bg-primary':'bg-muted')}/>)}</div>
  <section className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
   {demo.step==='qr'&&<><h2 className="font-semibold flex items-center gap-2"><QrCode size={19}/>{t.scan}</h2><canvas ref={canvas} aria-label={t.qrHint} className="mx-auto rounded-xl bg-white"/><p className="text-sm text-muted-foreground text-center">{t.qrHint}</p><Button disabled={!qrReady} onClick={scan}>{t.scan}</Button></>}
   {demo.step==='method'&&<><h2 className="font-semibold">{t.method}</h2><p className="text-sm text-muted-foreground">{t.phone}: <span className="font-mono">{FIXTURE_PHONE}</span></p><div className="grid grid-cols-2 gap-2">{(['sms','voice'] as const).map(c=><Button key={c} variant={channel===c?'primary':'outline'} aria-pressed={channel===c} onClick={()=>setChannel(c)}>{c==='sms'?<MessageSquare size={16}/>:<Phone size={16}/>} {t[c]}</Button>)}</div><Button onClick={()=>dispatch({type:'send',channel,now:Date.now(),code:mockCode()})}>{t.send}</Button></>}
   {demo.step==='otp'&&<><div className="rounded-xl border border-border bg-background p-4"><p className="text-xs text-muted-foreground">{t.inbox} · {t[demo.channel]}</p><p className="font-mono text-3xl tracking-widest mt-2">{demo.code}</p><p className="text-xs text-muted-foreground mt-2">{t.expires} {remaining(now,demo.issuedAt,OTP_TTL)}s</p></div><form className="flex flex-col gap-3" onSubmit={e=>{e.preventDefault();dispatch({type:'verify',now:Date.now(),code:entry})}}><label className="text-sm flex flex-col gap-2">{t.code}<input value={entry} onChange={e=>setEntry(e.target.value.replace(/[^0-9]/g,'').slice(0,6))} inputMode="numeric" autoComplete="off" maxLength={6} className="rounded-lg border border-border bg-background p-3 text-center font-mono tracking-widest"/></label><Button type="submit" disabled={entry.length!==6||demo.attempts>=3||remaining(now,demo.issuedAt,OTP_TTL)===0}>{t.verify}</Button></form><Button variant="outline" disabled={remaining(now,demo.issuedAt,RESEND_DELAY)>0} onClick={()=>dispatch({type:'resend',now:Date.now(),code:mockCode()})}>{remaining(now,demo.issuedAt,RESEND_DELAY)>0?t.retry+' '+remaining(now,demo.issuedAt,RESEND_DELAY)+'s':t.resend}</Button></>}
   {demo.step==='done'&&<div className="flex flex-col items-center gap-3 py-8"><CheckCircle2 size={40} className="text-success"/><h2 className="font-semibold text-lg text-center">{t.done}</h2></div>}
   {error&&<p role="alert" className="text-sm text-foreground">{t[error]}</p>}
   <Button variant="ghost" onClick={()=>dispatch({type:'reset'})}><RotateCcw size={16}/>{t.reset}</Button>
  </section><p className="text-xs text-muted-foreground">{t.intro}</p>
 </main>
}
