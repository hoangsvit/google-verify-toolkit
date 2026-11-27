import {describe,it,expect} from 'vitest';
import {advance,initialDemo,FIXTURE_QR,RESEND_DELAY,OTP_TTL,remaining,type Demo} from '../lib/sandbox';
import {sandboxWords} from '../locales/sandbox';
const method=advance(initialDemo(),{type:'scan',payload:FIXTURE_QR}).state;
const otp=()=>advance(method,{type:'send',channel:'sms',now:1000,code:'123456'}).state;
describe('isolated mock verification',()=>{
 it('accepts only the built-in fixture',()=>{expect(method.step).toBe('method');expect(advance(initialDemo(),{type:'scan',payload:'https://accounts.google.com/'}).error).toBe('invalidQr')});
 it('completes valid mock SMS and voice',()=>{for(const channel of ['sms','voice'] as const){const s=advance(method,{type:'send',channel,now:1000,code:'123456'}).state;expect(advance(s,{type:'verify',now:2000,code:'123456'}).state.step).toBe('done')}});
 it('enforces attempts and expiry',()=>{let s:Demo=otp();for(let i=0;i<3;i++)s=advance(s,{type:'verify',now:2000,code:'000000'}).state;expect(advance(s,{type:'verify',now:2000,code:'123456'}).error).toBe('locked');expect(advance(otp(),{type:'verify',now:1000+OTP_TTL,code:'123456'}).error).toBe('expired')});
 it('enforces cooldown and replaces code on resend',()=>{expect(advance(otp(),{type:'resend',now:1001,code:'654321'}).error).toBe('cooldown');const s=advance(otp(),{type:'resend',now:1000+RESEND_DELAY,code:'654321'}).state;expect(advance(s,{type:'verify',now:1000+RESEND_DELAY,code:'654321'}).state.step).toBe('done');expect(remaining(31000,1000,RESEND_DELAY)).toBe(0)});
 it('resets and rejects out-of-order operations',()=>{expect(advance(otp(),{type:'reset'}).state).toEqual(initialDemo());expect(advance(initialDemo(),{type:'verify',now:0,code:'123456'}).error).toBe('invalidStep')});
 it('has complete localized sandbox catalogs',()=>{for(const d of Object.values(sandboxWords))expect(Object.keys(d).sort()).toEqual(Object.keys(sandboxWords.en).sort())});
});
