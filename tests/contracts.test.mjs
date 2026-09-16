import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
test('public page exposes required DOM hooks and loads Supabase v2',()=>{const html=read('index.html');for(const id of ['memberGrid','searchInput','memberCount','statusBox'])assert.match(html,new RegExp(`id=["']${id}["']`));assert.match(html,/@supabase\/supabase-js@2/);assert.match(html,/assets\/public\.js/)});
test('config contains browser-safe placeholders only',()=>{const config=read('config.js');assert.match(config,/SUPABASE_URL/);assert.match(config,/SUPABASE_KEY/);assert.match(config,/ADMIN_EMAIL/);assert.doesNotMatch(config,/service_role/i);assert.doesNotMatch(config,/ADMIN_PASSWORD/i)});
test('admin page exposes login and CRUD hooks',()=>{const html=read('admin.html');for(const id of ['loginForm','adminPanel','memberForm','adminMemberList','logoutBtn'])assert.match(html,new RegExp(`id=["']${id}["']`));assert.match(html,/type=["']password["']/);assert.match(html,/assets\/admin\.js/)});
test('Supabase SQL enables RLS, anon select, admin-only writes, storage policies and realtime',()=>{const sql=read('supabase.sql');assert.match(sql,/enable row level security/i);assert.match(sql,/to anon/i);assert.match(sql,/auth\.jwt\(\).*email/is);assert.match(sql,/member-profiles/i);assert.match(sql,/storage\.objects/i);assert.match(sql,/supabase_realtime/i)});
