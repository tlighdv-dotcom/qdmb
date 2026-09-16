import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFacebookUrl, formatDateVN, validateMember, matchesMemberSearch, safeFileName } from '../assets/utils.js';
test('normalizeFacebookUrl adds https to facebook links without protocol',()=>assert.equal(normalizeFacebookUrl('facebook.com/abc'),'https://facebook.com/abc'));
test('normalizeFacebookUrl rejects non-http protocols',()=>assert.equal(normalizeFacebookUrl('javascript:alert(1)'),''));
test('formatDateVN renders yyyy-mm-dd as dd/mm/yyyy without timezone shift',()=>assert.equal(formatDateVN('2026-09-16'),'16/09/2026'));
test('validateMember requires id, name, facebook and join date',()=>{const result=validateMember({id_code:'',name:'A',facebook_url:'',joined_at:''});assert.equal(result.ok,false);assert.ok(result.errors.id_code);assert.ok(result.errors.facebook_url)});
test('matchesMemberSearch matches by id or Vietnamese-insensitive name text',()=>{const member={id_code:'1044301822',name:'Nguyễn Văn An'};assert.equal(matchesMemberSearch(member,'104430'),true);assert.equal(matchesMemberSearch(member,'nguyen van'),true);assert.equal(matchesMemberSearch(member,'khong co'),false)});
test('safeFileName removes unsafe characters but preserves extension',()=>assert.equal(safeFileName('Ảnh profile (1).PNG'),'anh-profile-1.png'));
