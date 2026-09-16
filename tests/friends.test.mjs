import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildFriendGroups, normalizeFriendIds } from '../assets/utils.js';
const read=(path)=>fs.readFileSync(new URL(`../${path}`, import.meta.url),'utf8');

test('normalizeFriendIds removes self, duplicates and unknown members',()=>{const members=[{id:'a'},{id:'b'},{id:'c'}];assert.deepEqual(normalizeFriendIds(['a','b','b','x','c'],'a',members),['b','c'])});
test('buildFriendGroups creates connected playing-together groups',()=>{const members=[{id:'a',name:'An'},{id:'b',name:'Bình'},{id:'c',name:'Chi'},{id:'d',name:'Dũng'}];const links=[['a','b'],['b','c']];assert.deepEqual(buildFriendGroups(members,links),[['An','Bình','Chi']])});
test('admin UI has friend toggle and member multi-select hooks',()=>{const html=read('admin.html');for(const id of ['hasFriendsInput','friendPicker','friendSearchInput','friendOptions','selectedFriends'])assert.match(html,new RegExp(`id=["']${id}["']`))});
test('public UI exposes friend group statistics',()=>{const html=read('index.html');for(const id of ['summaryWithFriends','friendGroups'])assert.match(html,new RegExp(`id=["']${id}["']`))});
test('Supabase schema stores canonical undirected member friendships with RLS and realtime',()=>{const sql=read('supabase.sql');assert.match(sql,/create table if not exists public\.member_friends/i);assert.match(sql,/member_a_id/i);assert.match(sql,/member_b_id/i);assert.match(sql,/check \(member_a_id <> member_b_id\)/i);assert.match(sql,/unique \(member_a_id, member_b_id\)/i);assert.match(sql,/member_friends.*enable row level security/is);assert.match(sql,/supabase_realtime.*member_friends/is)});
test('admin and public scripts load and synchronize system friendships',()=>{const admin=read('assets/admin.js');const pub=read('assets/public.js');assert.match(admin,/member_friends/);assert.match(admin,/syncFriendships/);assert.match(admin,/friendIdsForMember/);assert.match(pub,/member_friends/);assert.match(pub,/buildFriendGroups/);assert.match(pub,/friendIdsForMember/) });
