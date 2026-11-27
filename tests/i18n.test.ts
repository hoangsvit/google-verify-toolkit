import {describe,it,expect} from 'vitest';
import {dictionaries,locales,normalizeLanguage,resolveLocale} from '../locales';
describe('localized UI',()=>{
 it('all catalogs contain every English key',()=>{for(const l of locales){expect(Object.keys(dictionaries[l]).sort()).toEqual(Object.keys(dictionaries.en).sort());expect(Object.values(dictionaries[l]).every(s=>s.trim().length>0)).toBe(true)}});
 it('matches browser languages and respects explicit preferences',()=>{expect(resolveLocale('auto',['fr-FR','vi-VN'])).toBe('vi');expect(resolveLocale('auto',['zh-TW'])).toBe('zh-CN');expect(resolveLocale('auto',['fr-FR'])).toBe('en');expect(resolveLocale('ja',['en-US'])).toBe('ja')});
 it('normalizes invalid storage',()=>{expect(normalizeLanguage('xx')).toBe('auto');expect(normalizeLanguage('ko')).toBe('ko')});
});
