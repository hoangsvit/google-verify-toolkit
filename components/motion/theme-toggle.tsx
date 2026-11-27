// Adapted from beUI ThemeToggle (MIT; see licenses/beui.LICENSE).
// Uses extension storage rather than next-themes' inline bootstrap script.
import {Moon,Sun} from 'lucide-react';
import {motion,useReducedMotion} from 'motion/react';
import {flushSync} from 'react-dom';
import {useEffect,useState} from 'react';
import {Button} from './button/base';
import type {Preferences} from '../../lib/preferences';
type Props={theme:Preferences['theme'];disabled?:boolean;labels:{switchToLight:string;switchToDark:string};onChange:(theme:'light'|'dark')=>void};
export function ThemeToggle({theme,disabled,labels,onChange}:Props){
 const reduce=useReducedMotion();
 const [systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)');const sync=()=>setSystemDark(media.matches);media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[]);
 const dark=theme==='dark'||(theme==='system'&&systemDark);
 function toggle(){
  const next=dark?'light':'dark';
  const doc=document as Document & {startViewTransition?:(callback:()=>void)=>{finished:Promise<void>}};
  const apply=()=>flushSync(()=>onChange(next));
  if(reduce||!doc.startViewTransition){apply();return;}
  const root=document.documentElement;
  root.dataset.beuiVt='circle';
  const transition=doc.startViewTransition(apply);
  void transition.finished.catch(()=>{}).finally(()=>{delete root.dataset.beuiVt});
 }
 return <Button variant="ghost" size="icon" disabled={disabled} aria-label={dark?labels.switchToLight:labels.switchToDark} title={dark?labels.switchToLight:labels.switchToDark} onClick={toggle}><motion.span key={dark?'dark':'light'} initial={reduce?false:{opacity:0,scale:.85}} animate={{opacity:1,scale:1}}>{dark?<Sun size={18}/>:<Moon size={18}/>}</motion.span></Button>;
}
