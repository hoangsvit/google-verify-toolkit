// Local fixtures only. No external endpoints, real phone numbers or authentication tokens.
export const FIXTURE_QR = 'verify-toolkit-demo:v1:local-fixture';
export const FIXTURE_PHONE = '+1 202-555-0100'; // reserved fictional number
export const OTP_TTL = 120_000;
export const RESEND_DELAY = 30_000;
export type Channel = 'sms'|'voice';
export type Demo = {step:'qr'} | {step:'method'} | {step:'otp';channel:Channel;code:string;issuedAt:number;attempts:number} | {step:'done'};
export type Event = {type:'reset'}|{type:'scan';payload:string}|{type:'send';channel:Channel;now:number;code:string}|{type:'resend';now:number;code:string}|{type:'verify';now:number;code:string};
export type ErrorKey = 'invalidQr'|'wrongCode'|'expired'|'locked'|'cooldown'|'invalidStep';
export type Result = {state:Demo;error?:ErrorKey};
export const initialDemo = ():Demo=>({step:'qr'});
export function advance(state:Demo,event:Event):Result {
 const fail=(error:ErrorKey):Result=>({state,error});
 if(event.type==='reset')return {state:initialDemo()};
 if(event.type==='scan'&&state.step==='qr')return event.payload===FIXTURE_QR?{state:{step:'method'}}:fail('invalidQr');
 if(event.type==='send'&&state.step==='method'&&/^\d{6}$/.test(event.code))return {state:{step:'otp',channel:event.channel,code:event.code,issuedAt:event.now,attempts:0}};
 if(state.step==='otp'){
  if(event.type==='resend'){
   if(event.now-state.issuedAt<RESEND_DELAY)return fail('cooldown');
   if(!/^\d{6}$/.test(event.code))return fail('invalidStep');
   return {state:{...state,code:event.code,issuedAt:event.now,attempts:0}};
  }
  if(event.type==='verify'){
   if(state.attempts>=3)return fail('locked');
   if(event.now-state.issuedAt>=OTP_TTL)return fail('expired');
   if(event.code!==state.code)return {state:{...state,attempts:state.attempts+1},error:state.attempts+1>=3?'locked':'wrongCode'};
   return {state:{step:'done'}};
  }
 }
 return fail('invalidStep');
}
export function remaining(now:number,issuedAt:number,duration:number){return Math.max(0,Math.ceil((issuedAt+duration-now)/1000))}
export function mockCode(){return String(crypto.getRandomValues(new Uint32Array(1))[0]!%1_000_000).padStart(6,'0')}
