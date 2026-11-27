import {afterEach,describe,it,expect,vi} from 'vitest';
import {inspectGoogleDocument} from '../lib/inspect-page';
import {badgeFor,emptySnapshot} from '../lib/verification';
function element(label:string,hidden=false,disabled=false){
 return {innerText:label,childElementCount:0,getAttribute:()=>null,getClientRects:()=>hidden?[]:[{}],closest:()=>null,matches:()=>disabled};
}
function setup(controls:unknown[],headings:unknown[]=[],origin='https://accounts.google.com',instructions:unknown[]=[]){
 vi.stubGlobal('location',{origin});
 vi.stubGlobal('getComputedStyle',()=>({visibility:'visible'}));
 vi.stubGlobal('document',{querySelectorAll:(selector:string)=>selector.startsWith('button')?controls:selector.includes(',div,span')?instructions:headings});
}
afterEach(()=>vi.unstubAllGlobals());
describe('local verification option inspection',()=>{
 it('recognizes official methods and alternate option in English',()=>{
  setup([element('Try another way'),element('Send an SMS'),element('Phone call')],[element('Scan this QR code')]);
  expect(inspectGoogleDocument()).toEqual({qr:true,sms:true,voice:true,alternative:true,signupQr:false});
 });
 it('recognizes Vietnamese labels and ignores hidden or disabled choices',()=>{
  setup([element('Thử cách khác'),element('Tin nhắn',true),element('Cuộc gọi',false,true)],[element('Mã QR')]);
  expect(inspectGoogleDocument()).toEqual({qr:true,sms:false,voice:false,alternative:true,signupQr:false});
 });
 it('recognizes the Vietnamese signup QR screen even with plain text instructions',()=>{
  setup([],[], 'https://accounts.google.com',[element('Xác minh một số thông tin trước khi tạo tài khoản'),element('Quét mã QR bằng điện thoại')]);
  expect(inspectGoogleDocument()).toEqual({qr:true,signupQr:true,sms:false,voice:false,alternative:false});
 });
 it('recognizes the English signup QR screen',()=>{
  setup([], [element('Verify some information before creating an account')], 'https://accounts.google.com',[element('Scan the QR code with your phone')]);
  expect(inspectGoogleDocument()?.signupQr).toBe(true);
 });
 it('does not classify hidden signup instructions or a generic QR label as a signup challenge',()=>{
  setup([],[], 'https://accounts.google.com',[element('Xác minh một số thông tin trước khi tạo tài khoản',true),element('Quét mã QR bằng điện thoại')]);
  expect(inspectGoogleDocument()?.signupQr).toBe(false);
 });
 it('never inspects other origins',()=>{setup([],[],'https://example.com');expect(inspectGoogleDocument()).toBeNull()});
 it('badge indicates only detected methods',()=>{
  expect(badgeFor(emptySnapshot())).toBe('');
  expect(badgeFor({...emptySnapshot(),page:'google',checked:true,methods:{qr:'visible',sms:'visible',voice:'not-visible'}})).toBe('2');
 });
});
