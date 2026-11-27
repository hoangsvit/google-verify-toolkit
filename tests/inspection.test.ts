import {afterEach,describe,it,expect,vi} from 'vitest';
import {inspectGoogleDocument} from '../lib/inspect-page';
import {badgeFor,emptySnapshot} from '../lib/verification';
function element(label:string,hidden=false,disabled=false){
 return {innerText:label,getAttribute:()=>null,getClientRects:()=>hidden?[]:[{}],closest:()=>null,matches:()=>disabled};
}
function setup(controls:unknown[],headings:unknown[]=[],origin='https://accounts.google.com'){
 vi.stubGlobal('location',{origin});
 vi.stubGlobal('getComputedStyle',()=>({visibility:'visible'}));
 vi.stubGlobal('document',{querySelectorAll:(selector:string)=>selector.startsWith('button')?controls:headings});
}
afterEach(()=>vi.unstubAllGlobals());
describe('local verification option inspection',()=>{
 it('recognizes official methods and alternate option in English',()=>{
  setup([element('Try another way'),element('Send an SMS'),element('Phone call')],[element('Scan this QR code')]);
  expect(inspectGoogleDocument()).toEqual({qr:true,sms:true,voice:true,alternative:true});
 });
 it('recognizes Vietnamese labels and ignores hidden or disabled choices',()=>{
  setup([element('Thử cách khác'),element('Tin nhắn',true),element('Cuộc gọi',false,true)],[element('Mã QR')]);
  expect(inspectGoogleDocument()).toEqual({qr:true,sms:false,voice:false,alternative:true});
 });
 it('never inspects other origins',()=>{setup([],[],'https://example.com');expect(inspectGoogleDocument()).toBeNull()});
 it('badge indicates only detected methods',()=>{
  expect(badgeFor(emptySnapshot())).toBe('');
  expect(badgeFor({...emptySnapshot(),page:'google',checked:true,methods:{qr:'visible',sms:'visible',voice:'not-visible'}})).toBe('2');
 });
});
