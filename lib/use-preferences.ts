import {useEffect,useRef,useState} from 'react';
import {browser} from 'wxt/browser';
import {defaults,loadPreferences,normalizePreferences,savePreferences,type Preferences} from './preferences';
import {resolveLocale,dictionaries} from '../locales';
export function usePreferences(){
 const [prefs,setPrefs]=useState(defaults);
 const [ready,setReady]=useState(false);
 const revision=useRef(0);
 useEffect(()=>{
  let active=true;
  const sync=(changes:Record<string,{newValue?:unknown}>,area:string)=>{
   if(area==='local'&&changes.preferences){revision.current++;setPrefs(normalizePreferences(changes.preferences.newValue));setReady(true);}
  };
  browser.storage.onChanged.addListener(sync);
  const start=revision.current;
  void loadPreferences().then(value=>{if(active&&revision.current===start)setPrefs(value)}).catch(()=>{}).finally(()=>{if(active)setReady(true)});
  return ()=>{active=false;browser.storage.onChanged.removeListener(sync)};
 },[]);
 const locale=resolveLocale(prefs.language,navigator.languages);
 useEffect(()=>{
  const media=matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>{const dark=prefs.theme==='dark'||(prefs.theme==='system'&&media.matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';};
  apply();media.addEventListener('change',apply);
  document.documentElement.lang=locale;
  return ()=>media.removeEventListener('change',apply);
 },[prefs.theme,locale]);
 async function update(next:Preferences){
  const previous=prefs;const id=++revision.current;
  setPrefs(next);
  try{await savePreferences(next)}catch(error){if(revision.current===id)setPrefs(previous);throw error;}
 }
 return {prefs,ready,locale,t:dictionaries[locale],update};
}
