-- Food Rescue AI · initial migration. Run once on a new Supabase project.
begin;
create type public.app_role as enum ('restaurant','ngo','volunteer');
create type public.food_status as enum ('available','reserved','collected','completed');
create table public.users (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 100),
 role public.app_role not null,
 location text not null default 'Set your address in Settings' check(char_length(location)<=250),
 lat double precision not null default 0 check(lat between -90 and 90),
 lng double precision not null default 0 check(lng between -180 and 180),
 capacity integer not null default 30 check(capacity between 1 and 10000),
 created_at timestamptz not null default now()
);
create table public.donations (
 id uuid primary key default gen_random_uuid(),
 restaurant_id uuid not null references public.users(id),
 food_name text not null check(char_length(food_name) between 1 and 120),
 category text not null check(category in ('Prepared meals','Bakery','Produce','Dairy','Packaged food')),
 image_url text not null default '' check(char_length(image_url)<=2048 and (image_url='' or image_url like 'https://%')),
 quantity integer not null check(quantity between 1 and 10000),
 pickup_at timestamptz not null,
 expires_at timestamptz not null check(expires_at>pickup_at),
 location text not null check(char_length(location) between 1 and 250),
 lat double precision not null check(lat between -90 and 90),
 lng double precision not null check(lng between -180 and 180),
 description text not null check(char_length(description) between 1 and 2000),
 status public.food_status not null default 'available',
 created_at timestamptz not null default now()
);
create table public.reservations (
 id uuid primary key default gen_random_uuid(), donation_id uuid not null unique references public.donations(id),
 ngo_id uuid not null references public.users(id), status text not null default 'reserved' check(status in ('reserved','completed')),
 created_at timestamptz not null default now()
);
create table public.volunteer_tasks (
 id uuid primary key default gen_random_uuid(), donation_id uuid not null unique references public.donations(id),
 volunteer_id uuid references public.users(id), status text not null default 'open' check(status in ('open','accepted','collected','delivered')),
 created_at timestamptz not null default now(),
 check ((status='open' and volunteer_id is null) or (status<>'open' and volunteer_id is not null))
);
create table public.points (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 donation_id uuid not null references public.donations(id), amount integer not null check(amount>0),
 reason text not null check(reason in ('Pickup','Delivery','Donation completed')),
 created_at timestamptz not null default now(), unique(user_id,donation_id,reason)
);
create table public.badges (
 id uuid primary key default gen_random_uuid(), name text not null unique, role public.app_role not null, threshold integer not null check(threshold>0)
);
insert into public.badges(name,role,threshold) values
 ('Food Saver','restaurant',10),('Community Hero','restaurant',150),('Platinum Donor','restaurant',500),
 ('Helper','volunteer',10),('Rescuer','volunteer',100),('Champion','volunteer',300);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 message text not null, created_at timestamptz not null default now()
);
create table public.analytics (
 id uuid primary key default gen_random_uuid(), donation_id uuid not null unique references public.donations(id),
 meals integer not null, waste_kg numeric not null, co2_kg numeric not null, created_at timestamptz not null default now()
);
create table public.ai_usage (user_id uuid not null references public.users(id),day date not null,requests integer not null default 0, primary key(user_id,day));
create index donations_status_expiry on public.donations(status,expires_at);
create index donations_restaurant on public.donations(restaurant_id);
create index reservations_ngo on public.reservations(ngo_id);
create index tasks_volunteer on public.volunteer_tasks(volunteer_id);
create index points_user on public.points(user_id);
create index notifications_user_time on public.notifications(user_id,created_at desc);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.app_role;
begin
 r := coalesce(new.raw_user_meta_data->>'role','volunteer')::public.app_role;
 insert into public.users(id,name,role) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Community partner'),100),r);
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- All state and rewards are committed in the SAME transaction, with a row lock.
-- No client can directly write status, reservations, tasks, points or analytics.
create function public.transition_donation(p_action text,p_donation uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); r public.app_role; d public.donations%rowtype; t public.volunteer_tasks%rowtype; res public.reservations%rowtype; recipient uuid;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select role into r from public.users where id=uid;
 select * into d from public.donations where id=p_donation for update;
 if not found then raise exception 'Donation not found'; end if;
 select * into t from public.volunteer_tasks where donation_id=p_donation for update;
 select * into res from public.reservations where donation_id=p_donation for update;
 if p_action in ('reserve','accept','collect','confirm') and d.expires_at<=now() then raise exception 'This donation has expired'; end if;
 if p_action in ('collect','confirm') and d.pickup_at>now() then raise exception 'Pickup window has not started'; end if;
 if p_action='reserve' then
   if r<>'ngo' or d.status<>'available' then raise exception 'Food is no longer available or NGO access required'; end if;
   insert into public.reservations(donation_id,ngo_id) values(p_donation,uid);
   insert into public.volunteer_tasks(donation_id) values(p_donation);
   update public.donations set status='reserved' where id=p_donation;
 elsif p_action='accept' then
   if r<>'volunteer' or t.id is null or t.status<>'open' or d.status<>'reserved' then raise exception 'Delivery unavailable or volunteer access required'; end if;
   update public.volunteer_tasks set volunteer_id=uid,status='accepted' where id=t.id;
 elsif p_action='collect' then
   if r<>'volunteer' or t.volunteer_id is distinct from uid or t.status<>'accepted' or d.status<>'reserved' then raise exception 'This pickup is not assigned to you'; end if;
   update public.volunteer_tasks set status='collected' where id=t.id;
   update public.donations set status='collected' where id=p_donation;
   insert into public.points(user_id,donation_id,amount,reason) values(uid,p_donation,10,'Pickup');
 elsif p_action='deliver' then
   if r<>'volunteer' or t.volunteer_id is distinct from uid or t.status<>'collected' or d.status<>'collected' then raise exception 'Collect the food before marking delivered'; end if;
   update public.volunteer_tasks set status='delivered' where id=t.id;
   insert into public.points(user_id,donation_id,amount,reason) values(uid,p_donation,case when d.expires_at>now() and d.expires_at<=now()+interval '2 hours' then 25 else 15 end,'Delivery');
 elsif p_action='confirm' then
   if r<>'ngo' or res.ngo_id is distinct from uid or d.status<>'reserved' or (t.id is not null and t.status<>'open') then raise exception 'Self-pickup unavailable; assigned volunteer must complete delivery'; end if;
   delete from public.volunteer_tasks where donation_id=p_donation;
 else raise exception 'Unsupported action';
 end if;
 if p_action in ('deliver','confirm') then
   update public.donations set status='completed' where id=p_donation;
   update public.reservations set status='completed' where donation_id=p_donation;
   insert into public.points(user_id,donation_id,amount,reason) values(d.restaurant_id,p_donation,case when d.quantity<10 then 10 when d.quantity<30 then 25 else 50 end,'Donation completed');
   insert into public.analytics(donation_id,meals,waste_kg,co2_kg) values(p_donation,d.quantity,d.quantity*.4,d.quantity*.4*2.5);
 end if;
 -- All participants can follow state changes in their own inbox.
 for recipient in select distinct x from unnest(array[d.restaurant_id,res.ngo_id,t.volunteer_id,uid]) as u(x) where x is not null loop
   insert into public.notifications(user_id,message) values(recipient,d.food_name||': '||p_action);
 end loop;
end $$;

create function public.consume_ai_quota() returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer; uid uuid:=auth.uid();
begin
 if uid is null or not exists(select 1 from public.users where id=uid and role='restaurant') then return false; end if;
 insert into public.ai_usage(user_id,day,requests) values(uid,(now() at time zone 'UTC')::date,1)
 on conflict(user_id,day) do update set requests=ai_usage.requests+1 where ai_usage.requests<10 returning requests into n;
 return n is not null;
end $$;

alter table public.users enable row level security;
alter table public.donations enable row level security;
alter table public.reservations enable row level security;
alter table public.volunteer_tasks enable row level security;
alter table public.points enable row level security;
alter table public.badges enable row level security;
alter table public.notifications enable row level security;
alter table public.analytics enable row level security;
alter table public.ai_usage enable row level security;

-- Profile data is a directory visible to signed-in community members; emails stay in auth.users.
create policy directory_read on public.users for select to authenticated using(true);
create policy profile_update on public.users for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy donation_read on public.donations for select to authenticated using(true);
create policy donation_create on public.donations for insert to authenticated with check(
 restaurant_id=auth.uid() and status='available' and expires_at>now()
 and created_at between now()-interval '1 minute' and now()+interval '1 minute'
 and exists(select 1 from public.users where id=auth.uid() and role='restaurant')
);
create policy reservation_read on public.reservations for select to authenticated using(true);
create policy task_read on public.volunteer_tasks for select to authenticated using(true);
create policy point_read on public.points for select to authenticated using(true);
create policy badge_read on public.badges for select to authenticated using(true);
create policy notification_read on public.notifications for select to authenticated using(user_id=auth.uid());
create policy analytics_read on public.analytics for select to authenticated using(true);
create policy usage_read on public.ai_usage for select to authenticated using(user_id=auth.uid());

-- Explicit grants restrict columns, even if API callers bypass the UI.
revoke all on public.users,public.donations,public.reservations,public.volunteer_tasks,public.points,public.badges,public.notifications,public.analytics,public.ai_usage from anon,authenticated;
grant select on public.users,public.donations,public.reservations,public.volunteer_tasks,public.points,public.badges,public.notifications,public.analytics,public.ai_usage to authenticated;
grant update(name,location,lat,lng,capacity) on public.users to authenticated;
grant insert(restaurant_id,food_name,category,image_url,quantity,pickup_at,expires_at,location,lat,lng,description) on public.donations to authenticated;
revoke all on function public.handle_new_user() from public;
revoke all on function public.transition_donation(text,uuid) from public;
revoke all on function public.consume_ai_quota() from public;
grant execute on function public.transition_donation(text,uuid),public.consume_ai_quota() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('food-images','food-images',true,4194304,array['image/jpeg','image/png','image/webp']);
create policy food_image_read on storage.objects for select to public using(bucket_id='food-images');
create policy food_image_upload on storage.objects for insert to authenticated with check(bucket_id='food-images' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.users where id=auth.uid() and role='restaurant'));
create policy food_image_remove on storage.objects for delete to authenticated using(bucket_id='food-images' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
