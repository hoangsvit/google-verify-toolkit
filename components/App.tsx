import {useEffect,useRef,useState} from 'react';
import {ShieldCheck,Scan,MessageSquare,Phone,QrCode,Globe,Activity,Settings,Copy,ExternalLink,SunMoon,RefreshCw} from 'lucide-react';
import {browser} from 'wxt/browser';
import {Button} from './motion/button/base';
import {inspectActiveTab} from '../lib/inspect';
import {emptySnapshot,diagnosticReport,type Method} from '../lib/verification';
import {defaults,loadPreferences,savePreferences,type Preferences} from '../lib/preferences';

const words = {
 en:{overview:'Overview',diagnostics:'Diagnostics',settings:'Settings',subtitle:'Account verification assistant',current:'Current page',google:'Google Accounts',other:'Other website',unknown:'Not checked',methods:'Verification methods',qr:'QR verification',sms:'SMS verification',voice:'Voice verification',visible:'Visible option',hidden:'Not detected',check:'Check current page',refresh:'Check again',checking:'Checking…',hint:'Only methods shown by Google are detected. An undetected option may still be available elsewhere in the official flow.',privacy:'Local processing · No stored credentials',copy:'Copy diagnostics',copied:'Copied',copyFail:'Copy failed',help:'Google account help',theme:'Appearance',language:'Language',system:'System',light:'Light',dark:'Dark',result:'Page inspection',success:'Completed',unavailable:'Not completed',saveFail:'Could not save preferences.'},
 vi:{overview:'Tổng quan',diagnostics:'Chẩn đoán',settings:'Cài đặt',subtitle:'Trợ lý xác minh tài khoản',current:'Trang hiện tại',google:'Tài khoản Google',other:'Trang web khác',unknown:'Chưa kiểm tra',methods:'Phương thức xác minh',qr:'Xác minh QR',sms:'Xác minh SMS',voice:'Xác minh cuộc gọi',visible:'Có hiển thị',hidden:'Chưa phát hiện',check:'Kiểm tra trang hiện tại',refresh:'Kiểm tra lại',checking:'Đang kiểm tra…',hint:'Chỉ nhận diện lựa chọn Google đang hiển thị. Phương thức chưa phát hiện có thể xuất hiện ở bước chính thức khác.',privacy:'Xử lý cục bộ · Không lưu thông tin xác thực',copy:'Sao chép báo cáo',copied:'Đã sao chép',copyFail:'Không thể sao chép',help:'Trợ giúp tài khoản Google',theme:'Giao diện',language:'Ngôn ngữ',system:'Hệ thống',light:'Sáng',dark:'Tối',result:'Kiểm tra trang',success:'Hoàn tất',unavailable:'Chưa hoàn tất',saveFail:'Không thể lưu cài đặt.'},
};
export function App({panel=false}:{panel?:boolean}){
 const [prefs,setPrefs]=useState(defaults);
 const [tab,setTab]=useState<'overview'|'diagnostics'|'settings'>('overview');
 const [snapshot,setSnapshot]=useState(emptySnapshot);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const t=words[prefs.language];
 const scanVersion=useRef(0);
 const guidance=prefs.language==='vi'?{
  title:'Hướng dẫn xác minh',alt:'Thử cách khác',detected:'Có lựa chọn trên trang Google',missing:'Chưa phát hiện lựa chọn',unknown:'Chưa kiểm tra',steps:'Nếu Google hiển thị “Thử cách khác”, chọn trực tiếp trên trang Google. Chọn SMS hoặc cuộc gọi nếu được cung cấp và nhập mã trên Google.',permission:'Không thể đọc trang này. Mở extension từ thanh công cụ trên tab Google rồi kiểm tra lại.',side:'Side Panel có thể mở từ menu trình duyệt. Sau khi đổi trang, mở extension trên tab mới để cấp quyền kiểm tra.',qr:'Nhận diện từ nhãn QR hiển thị; không đọc dữ liệu QR.'
 }:{
  title:'Verification guidance',alt:'Try another way',detected:'Option shown on Google',missing:'Option not detected',unknown:'Not checked',steps:'If Google offers “Try another way”, select it directly on Google. Choose SMS or voice if offered and enter the code on Google.',permission:'Unable to inspect this page. Open the extension from the toolbar on the Google tab and try again.',side:'Open the side panel from your browser menu. After navigating, open the extension on the new tab to grant inspection access.',qr:'Detects visible QR labels; never reads the QR payload.'
 };
 useEffect(()=>{
  const reset=()=>{scanVersion.current++;setSnapshot(emptySnapshot());setBusy(false);setNotice('');};
  const onUpdate=(_id:number,change:{status?:string;url?:string},tab:{active?:boolean})=>{if(tab.active&&(change.status==='loading'||change.url))reset();};
  browser.tabs.onActivated.addListener(reset);
  browser.tabs.onUpdated.addListener(onUpdate);
  return ()=>{browser.tabs.onActivated.removeListener(reset);browser.tabs.onUpdated.removeListener(onUpdate);};
 },[]);
 useEffect(()=>{void loadPreferences().then(setPrefs).catch(()=>{});},[]);
 useEffect(()=>{
  const media=matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>document.documentElement.classList.toggle('dark',prefs.theme==='dark'||(prefs.theme==='system'&&media.matches));
  apply();media.addEventListener('change',apply);
  document.documentElement.lang=prefs.language;
  return ()=>media.removeEventListener('change',apply);
 },[prefs]);
 async function update(next:Preferences){setPrefs(next);try{await savePreferences(next)}catch{setNotice(t.saveFail)}}
 async function scan(){const version=++scanVersion.current;setBusy(true);setNotice('');try{const result=await inspectActiveTab();if(version===scanVersion.current)setSnapshot(result)}catch{if(version===scanVersion.current)setSnapshot(emptySnapshot())}finally{if(version===scanVersion.current)setBusy(false)}}
 async function copy(){try{await navigator.clipboard.writeText(diagnosticReport(snapshot));setNotice(t.copied)}catch{setNotice(t.copyFail)}}
 const methods=[['qr',QrCode],['sms',MessageSquare],['voice',Phone]] as const;
 const status=(method:Method)=>snapshot.methods[method]==='visible'?t.visible:snapshot.methods[method]==='not-visible'?t.hidden:t.unknown;
 return <main className={(panel?"w-full":"w-[390px]")+" max-w-full min-h-[520px] p-4 flex flex-col gap-4"}>
  <header className="flex items-center gap-3"><div className="rounded-2xl bg-primary/15 p-3 text-primary"><ShieldCheck size={26}/></div><div className="flex-1"><h1 className="font-semibold text-base">Google Verify Toolkit</h1><p className="text-xs text-muted-foreground">{t.subtitle}</p></div><Button variant="ghost" size="icon" aria-label={t.theme} onClick={()=>void update({...prefs,theme:prefs.theme==='dark'?'light':prefs.theme==='light'?'system':'dark'})}><SunMoon size={18}/></Button></header>
  <nav aria-label="Navigation" className="flex gap-1 rounded-2xl bg-muted p-1">{(['overview','diagnostics','settings'] as const).map(key=><Button key={key} variant={tab===key?'secondary':'ghost'} size="sm" aria-pressed={tab===key} className="flex-1" onClick={()=>{setTab(key);setNotice('')}}>{t[key]}</Button>)}</nav>
  {tab!=='settings'&&<><section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-2"><Globe className="text-primary" size={19}/><h2 className="text-sm font-medium">{t.current}</h2></div><p className="mt-2 text-sm">{snapshot.page==='google'?t.google:snapshot.page==='other'?t.other:t.unknown}</p><p className="mt-1 text-xs text-muted-foreground">{snapshot.page==='google'?'accounts.google.com':t.hint}</p></section>
  <section className="flex flex-col gap-2"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.methods}</h2>{methods.map(([key,Icon])=><div key={key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon size={19}/></div><div className="flex-1"><div className="text-sm font-medium">{t[key]}</div><p className="text-xs text-muted-foreground">{status(key)}</p></div></div>)}</section>
  <Button className="w-full" size="lg" disabled={busy} onClick={()=>void scan()}>{busy?<RefreshCw size={17} className="motion-safe:animate-spin"/>:<Scan size={17}/>} {busy?t.checking:snapshot.checked?t.refresh:t.check}</Button>
  {tab==='diagnostics'&&<section className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2"><div className="flex items-center gap-2 text-sm"><Activity size={16}/>{t.result}: {snapshot.checked?t.success:t.unavailable}</div><Button variant="outline" onClick={()=>void copy()}><Copy size={15}/>{t.copy}</Button></section>}
  <section className="rounded-xl border border-border bg-card p-3 space-y-2"><h2 className="text-sm font-medium">{guidance.title}</h2><div className="flex justify-between gap-2 text-xs"><span>{guidance.alt}</span><span className="text-muted-foreground">{snapshot.alternative==='visible'?guidance.detected:snapshot.alternative==='not-visible'?guidance.missing:guidance.unknown}</span></div><p className="text-xs text-muted-foreground">{guidance.steps}</p><p className="text-xs text-muted-foreground">{guidance.qr}</p></section>
  {snapshot.page==='google'&&!snapshot.checked&&<p role="status" className="text-xs text-primary">{guidance.permission}</p>}
  <p className="text-xs leading-relaxed text-muted-foreground">{t.hint}</p>{panel&&<p className="text-xs text-muted-foreground">{guidance.side}</p>}</>}
  {tab==='settings'&&<section className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4"><h2 className="flex items-center gap-2 font-medium"><Settings size={17}/>{t.settings}</h2><label className="flex flex-col gap-2 text-sm">{t.theme}<select className="rounded-lg border border-border bg-background p-2" value={prefs.theme} onChange={e=>void update({...prefs,theme:e.target.value as Preferences['theme']})}>{(['system','light','dark'] as const).map(key=><option key={key} value={key}>{t[key]}</option>)}</select></label><label className="flex flex-col gap-2 text-sm">{t.language}<select className="rounded-lg border border-border bg-background p-2" value={prefs.language} onChange={e=>void update({...prefs,language:e.target.value as Preferences['language']})}><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label></section>}
  {notice&&<p role="status" className="text-xs text-primary">{notice}</p>}
  <footer className="mt-auto flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><p className="flex items-center gap-1"><ShieldCheck size={14}/>{t.privacy}</p><div className="flex justify-between"><button className="flex items-center gap-1" onClick={()=>void browser.tabs.create({url:'https://support.google.com/accounts/'})}>{t.help}<ExternalLink size={12}/></button><button className="flex items-center gap-1" onClick={()=>void browser.tabs.create({url:'https://github.com/hoangsvit/google-verify-toolkit'})}>GitHub<ExternalLink size={12}/></button><span>v{browser.runtime.getManifest().version}</span></div></footer>
 </main>;
}
