-- Ekip MVP database schema for Supabase (Postgres).
-- Paste into the Supabase SQL Editor and run ONCE on a fresh project.
-- Built from the Ekip PRD: MVP requirements only (job/course/training section is Stretch and not included).

-- =====================================================================
-- Helper: keep updated_at current
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- 1. profiles: one row per signed-in user (login itself lives in auth.users)
--    Only collects what is needed to give help: no phone, address or email here.
-- =====================================================================
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text not null default '',
  language          text not null default 'ht' check (language in ('ht', 'fr', 'es', 'en')),
  country           text,                     -- ISO country code, e.g. 'HT', 'US'
  department        text,                     -- Haiti department, e.g. 'Ouest' (optional)
  city              text,                     -- city or neighborhood (optional)
  user_type         text not null default 'community_member'
                      check (user_type in ('student', 'teacher', 'community_member')),
  organization_name text,                     -- school or organization, if any
  verified_at       timestamptz,              -- set by the Ekip team after checking the person
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Ekip team members (can see all reports, manage resources, get notified of new requests).
-- Rows are added by hand in the SQL editor, never by the app.
create table public.team_members (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_members where user_id = (select auth.uid()));
$$;

-- Create a profile automatically when someone signs up.
-- The sign-up form can pass language, country, department, city, user_type and
-- display_name as user metadata; bad values fall back to safe defaults.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, display_name, language, country, department, city, user_type)
  values (
    new.id,
    coalesce(meta ->> 'display_name', ''),
    case when meta ->> 'language' in ('ht', 'fr', 'es', 'en') then meta ->> 'language' else 'ht' end,
    meta ->> 'country',
    meta ->> 'department',
    meta ->> 'city',
    case when meta ->> 'user_type' in ('student', 'teacher', 'community_member')
         then meta ->> 'user_type' else 'community_member' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 2. categories: types of help (computers, books, ...) with names in each language
-- =====================================================================
create table public.categories (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  name_ht text not null,
  name_fr text not null,
  name_es text not null,
  name_en text not null
);

insert into public.categories (slug, name_ht, name_fr, name_es, name_en) values
  ('computers',        'Òdinatè',          'Ordinateurs',          'Computadoras',     'Computers'),
  ('chromebooks',      'Chromebook',       'Chromebooks',          'Chromebooks',      'Chromebooks'),
  ('books',            'Liv',              'Livres',               'Libros',           'Books'),
  ('school_supplies',  'Founiti lekòl',    'Fournitures scolaires','Útiles escolares', 'School supplies'),
  ('information',      'Enfòmasyon',       'Information',          'Información',      'Information'),
  ('volunteer_support','Sipò volontè',     'Soutien bénévole',     'Apoyo voluntario', 'Volunteer support');

-- =====================================================================
-- 3. educational_resources: the library shown on the Home / Resources screen
--    One row per language version. Managed by the Ekip team.
-- =====================================================================
create table public.educational_resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  url          text,
  language     text not null check (language in ('ht', 'fr', 'es', 'en')),
  category_id  uuid references public.categories (id),
  is_published boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index educational_resources_language_idx on public.educational_resources (language, category_id)
  where is_published;

create trigger educational_resources_set_updated_at
  before update on public.educational_resources
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 4. requests: a teacher (or school) asks for computers, Chromebooks, etc.
--    status: submitted -> matched -> delivered
-- =====================================================================
create table public.requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  category_id  uuid not null references public.categories (id),
  title        text not null,
  description  text,
  quantity     integer not null default 1 check (quantity > 0),
  status       text not null default 'submitted' check (status in ('submitted', 'matched', 'delivered')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index requests_status_idx    on public.requests (status, category_id);
create index requests_requester_idx on public.requests (requester_id);

create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5. offers: a community member offers to donate something
--    status: available -> matched -> delivered
-- =====================================================================
create table public.offers (
  id          uuid primary key default gen_random_uuid(),
  donor_id    uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  category_id uuid not null references public.categories (id),
  title       text not null,
  description text,
  quantity    integer not null default 1 check (quantity > 0),
  status      text not null default 'available' check (status in ('available', 'matched', 'delivered')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index offers_status_idx on public.offers (status, category_id);
create index offers_donor_idx  on public.offers (donor_id);

create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 6. matches: pairs one request with one offer (MVP: one-to-one).
--    The chat and the delivery photo hang off a match.
--    received_confirmed_at is set by the requester when the donation arrives.
-- =====================================================================
create table public.matches (
  id                    uuid primary key default gen_random_uuid(),
  request_id            uuid not null unique references public.requests (id) on delete cascade,
  offer_id              uuid not null unique references public.offers (id) on delete cascade,
  created_by            uuid references public.profiles (id) on delete set null default auth.uid(),
  received_confirmed_at timestamptz,
  created_at            timestamptz not null default now()
);

-- Is the current user the requester or the donor of this match? (used by security rules)
create or replace function public.is_match_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.matches m
    join public.requests r on r.id = m.request_id
    join public.offers   o on o.id = m.offer_id
    where m.id = p_match_id
      and (select auth.uid()) in (r.requester_id, o.donor_id)
  );
$$;

-- When a match is created, mark the request and offer as matched.
-- When the requester confirms receipt, mark both as delivered.
create or replace function public.sync_match_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.requests set status = 'matched' where id = new.request_id;
    update public.offers   set status = 'matched' where id = new.offer_id;
  elsif new.received_confirmed_at is not null and old.received_confirmed_at is null then
    update public.requests set status = 'delivered' where id = new.request_id;
    update public.offers   set status = 'delivered' where id = new.offer_id;
  end if;
  return new;
end;
$$;

create trigger matches_sync_status
  after insert or update of received_confirmed_at on public.matches
  for each row execute function public.sync_match_status();

-- =====================================================================
-- 7. messages: chat between the requester and the donor of a match
-- =====================================================================
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  body       text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_match_idx on public.messages (match_id, created_at);

-- =====================================================================
-- 8. match_photos: the confirmation image sent when help is provided.
--    The file itself goes in the Storage bucket 'delivery-photos';
--    storage_path is its path there, in the form '<match_id>/<file name>'.
-- =====================================================================
create table public.match_photos (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid not null references public.matches (id) on delete cascade,
  uploaded_by  uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  storage_path text not null,
  caption      text,
  created_at   timestamptz not null default now()
);

create index match_photos_match_idx on public.match_photos (match_id);

-- =====================================================================
-- 9. notifications: tells the Ekip team when a teacher submits a request
-- =====================================================================
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null check (type in ('new_request')),
  request_id uuid references public.requests (id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at);

create or replace function public.notify_team_of_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, request_id)
  select user_id, 'new_request', new.id from public.team_members;
  return new;
end;
$$;

create trigger requests_notify_team
  after insert on public.requests
  for each row execute function public.notify_team_of_request();

-- =====================================================================
-- 10. reports: basic scam / suspicious-offer protection.
--     Anyone can report one profile, offer or request; the team reviews.
-- =====================================================================
create table public.reports (
  id                  uuid primary key default gen_random_uuid(),
  reporter_id         uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  reported_profile_id uuid references public.profiles (id) on delete cascade,
  reported_offer_id   uuid references public.offers (id) on delete cascade,
  reported_request_id uuid references public.requests (id) on delete cascade,
  reason              text not null check (length(reason) between 1 and 1000),
  status              text not null default 'open' check (status in ('open', 'reviewing', 'closed')),
  created_at          timestamptz not null default now(),
  -- exactly one thing is reported
  constraint reports_one_target check (
    num_nonnulls(reported_profile_id, reported_offer_id, reported_request_id) = 1
  )
);

create index reports_status_idx on public.reports (status);

-- =====================================================================
-- ACCESS CONTROL
-- Start from nothing, then grant only what the app needs.
-- Row Level Security decides WHICH rows; column grants decide WHICH columns can be edited.
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;

alter table public.profiles              enable row level security;
alter table public.team_members          enable row level security;
alter table public.categories            enable row level security;
alter table public.educational_resources enable row level security;
alter table public.requests              enable row level security;
alter table public.offers                enable row level security;
alter table public.matches               enable row level security;
alter table public.messages              enable row level security;
alter table public.match_photos          enable row level security;
alter table public.notifications         enable row level security;
alter table public.reports               enable row level security;

-- categories + published resources are public (the language screen and Home work before login)
grant select on public.categories            to anon, authenticated;
grant select on public.educational_resources to anon, authenticated;

create policy "categories are public" on public.categories
  for select using (true);

create policy "published resources are public" on public.educational_resources
  for select using (is_published or public.is_team_member());

grant insert, update, delete on public.educational_resources to authenticated;
create policy "team manages resources (insert)" on public.educational_resources
  for insert to authenticated with check (public.is_team_member());
create policy "team manages resources (update)" on public.educational_resources
  for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team manages resources (delete)" on public.educational_resources
  for delete to authenticated using (public.is_team_member());

-- profiles: signed-in users can see profiles (no email/phone is stored here);
-- you can edit only your own, and never verified_at.
grant select on public.profiles to authenticated;
grant update (display_name, language, country, department, city, user_type, organization_name)
  on public.profiles to authenticated;

create policy "signed-in users read profiles" on public.profiles
  for select to authenticated using (true);
create policy "users edit their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- team_members: you can only see whether you yourself are on the team
grant select on public.team_members to authenticated;
create policy "see own team membership" on public.team_members
  for select to authenticated using (user_id = (select auth.uid()));

-- requests: signed-in users can browse; you create and edit your own while still 'submitted'
grant select on public.requests to authenticated;
grant insert (category_id, title, description, quantity) on public.requests to authenticated;
grant update (category_id, title, description, quantity) on public.requests to authenticated;
grant delete on public.requests to authenticated;

create policy "signed-in users read requests" on public.requests
  for select to authenticated using (true);
create policy "create own request" on public.requests
  for insert to authenticated with check (requester_id = (select auth.uid()));
create policy "edit own submitted request" on public.requests
  for update to authenticated
  using (requester_id = (select auth.uid()) and status = 'submitted')
  with check (requester_id = (select auth.uid()));
create policy "delete own submitted request" on public.requests
  for delete to authenticated
  using (requester_id = (select auth.uid()) and status = 'submitted');

-- offers: same idea, for donors
grant select on public.offers to authenticated;
grant insert (category_id, title, description, quantity) on public.offers to authenticated;
grant update (category_id, title, description, quantity) on public.offers to authenticated;
grant delete on public.offers to authenticated;

create policy "signed-in users read offers" on public.offers
  for select to authenticated using (true);
create policy "create own offer" on public.offers
  for insert to authenticated with check (donor_id = (select auth.uid()));
create policy "edit own available offer" on public.offers
  for update to authenticated
  using (donor_id = (select auth.uid()) and status = 'available')
  with check (donor_id = (select auth.uid()));
create policy "delete own available offer" on public.offers
  for delete to authenticated
  using (donor_id = (select auth.uid()) and status = 'available');

-- matches: a donor accepts a request with their own available offer;
-- the requester confirms receipt. Only the two people involved (and the team) can see it.
grant select on public.matches to authenticated;
grant insert (request_id, offer_id) on public.matches to authenticated;
grant update (received_confirmed_at) on public.matches to authenticated;

create policy "participants and team read matches" on public.matches
  for select to authenticated
  using (public.is_match_participant(id) or public.is_team_member());

create policy "donor accepts a submitted request" on public.matches
  for insert to authenticated
  with check (
    exists (select 1 from public.offers   o where o.id = offer_id   and o.donor_id = (select auth.uid()) and o.status = 'available')
    and exists (select 1 from public.requests r where r.id = request_id and r.status = 'submitted')
  );

create policy "requester confirms receipt" on public.matches
  for update to authenticated
  using (exists (select 1 from public.requests r where r.id = request_id and r.requester_id = (select auth.uid())))
  with check (exists (select 1 from public.requests r where r.id = request_id and r.requester_id = (select auth.uid())));

-- messages: only the two people in the match can read or write
grant select on public.messages to authenticated;
grant insert (match_id, body) on public.messages to authenticated;

create policy "participants read messages" on public.messages
  for select to authenticated using (public.is_match_participant(match_id));
create policy "participants send messages" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_match_participant(match_id));

-- match_photos: same two people
grant select on public.match_photos to authenticated;
grant insert (match_id, storage_path, caption) on public.match_photos to authenticated;

create policy "participants read photos" on public.match_photos
  for select to authenticated using (public.is_match_participant(match_id));
create policy "participants add photos" on public.match_photos
  for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and public.is_match_participant(match_id));

-- notifications: you see and mark your own as read
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "read own notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "mark own notifications read" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- reports: anyone signed in can file one and see their own; the team sees and updates all
grant select on public.reports to authenticated;
grant insert (reported_profile_id, reported_offer_id, reported_request_id, reason) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;

create policy "read own reports or all if team" on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_team_member());
create policy "file a report" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "team updates report status" on public.reports
  for update to authenticated using (public.is_team_member()) with check (public.is_team_member());

-- =====================================================================
-- STORAGE: private bucket for delivery confirmation photos
-- File path must start with the match id: '<match_id>/<file name>'
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('delivery-photos', 'delivery-photos', false)
on conflict (id) do nothing;

create policy "participants upload delivery photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'delivery-photos'
    and public.is_match_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "participants view delivery photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'delivery-photos'
    and public.is_match_participant(((storage.foldername(name))[1])::uuid)
  );
