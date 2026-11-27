import {describe,it,expect} from 'vitest';
import {isGooglePage,emptySnapshot,diagnosticReport} from '../lib/verification';
describe('verification privacy boundaries',()=>{
 it('only accepts the exact HTTPS accounts origin',()=>{
  expect(isGooglePage('https://accounts.google.com/signin')).toBe(true);
  for(const url of ['http://accounts.google.com','https://accounts.google.com.evil.test','https://evil.test/?accounts.google.com','https://accounts.google.com:444','https://user@accounts.google.com','not a URL',undefined]) expect(isGooglePage(url)).toBe(false);
 });
 it('does not infer methods before inspection',()=>expect(emptySnapshot().methods.sms).toBe('unknown'));
 it('serializes only allowlisted diagnostic fields',()=>{
  const snapshot={...emptySnapshot(),secret:'do-not-copy',methods:{...emptySnapshot().methods,token:'do-not-copy'}};
  expect(diagnosticReport(snapshot)).not.toContain('do-not-copy');
 });
});
