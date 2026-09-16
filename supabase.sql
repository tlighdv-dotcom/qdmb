-- QDMB / GitHub Pages + Supabase setup
-- Authorization uses auth.users.raw_app_meta_data.role = 'admin'.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  id_code text not null unique,
  name text not null,
  facebook_url text not null,
  profile_url text,
  profile_path text,
  joined_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_members_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at before update on public.members
for each row execute function public.set_members_updated_at();

alter table public.members enable row level security;
grant select on table public.members to anon;
grant select, insert, update, delete on table public.members to authenticated;

drop policy if exists "public read members" on public.members;
create policy "public read members" on public.members for select to anon using (true);

drop policy if exists "authenticated read members" on public.members;
create policy "authenticated read members" on public.members for select to authenticated using (true);

drop policy if exists "admin insert members" on public.members;
create policy "admin insert members" on public.members for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin update members" on public.members;
create policy "admin update members" on public.members for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin delete members" on public.members;
create policy "admin delete members" on public.members for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('member-profiles','member-profiles',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public=excluded.public,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "admin read profile objects" on storage.objects;
create policy "admin read profile objects" on storage.objects for select to authenticated
using (bucket_id='member-profiles' and (((select auth.jwt()) -> 'app_metadata' ->> 'role')='admin'));

drop policy if exists "admin upload profile objects" on storage.objects;
create policy "admin upload profile objects" on storage.objects for insert to authenticated
with check (bucket_id='member-profiles' and (((select auth.jwt()) -> 'app_metadata' ->> 'role')='admin'));

drop policy if exists "admin update profile objects" on storage.objects;
create policy "admin update profile objects" on storage.objects for update to authenticated
using (bucket_id='member-profiles' and (((select auth.jwt()) -> 'app_metadata' ->> 'role')='admin'))
with check (bucket_id='member-profiles' and (((select auth.jwt()) -> 'app_metadata' ->> 'role')='admin'));

drop policy if exists "admin delete profile objects" on storage.objects;
create policy "admin delete profile objects" on storage.objects for delete to authenticated
using (bucket_id='member-profiles' and (((select auth.jwt()) -> 'app_metadata' ->> 'role')='admin'));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='members'
  ) then
    execute 'alter publication supabase_realtime add table public.members';
  end if;
end
$$;

-- After creating the administrator in Authentication > Users, promote it once:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'YOUR_ADMIN_EMAIL';
