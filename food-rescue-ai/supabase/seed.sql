-- Run AFTER creating these THREE accounts via the app's Sign Up page:
-- restaurant@foodrescue.example (Restaurant)
-- ngo@foodrescue.example (NGO)
-- volunteer@foodrescue.example (Volunteer)
-- Use your own reachable email addresses instead if email confirmation is on;
-- replace the three emails below accordingly. Never publish shared live credentials.
-- This script does NOT create auth users or hardcode passwords.
begin;
do $$
declare rest uuid; ngo uuid; vol uuid;
begin
 select id into rest from auth.users where email='restaurant@foodrescue.example';
 select id into ngo from auth.users where email='ngo@foodrescue.example';
 select id into vol from auth.users where email='volunteer@foodrescue.example';
 if rest is null or ngo is null or vol is null then raise exception 'Create the three seed accounts first, or replace emails in seed.sql with your real account emails.'; end if;
 if not exists(select 1 from public.users where id=rest and role='restaurant') or not exists(select 1 from public.users where id=ngo and role='ngo') or not exists(select 1 from public.users where id=vol and role='volunteer') then raise exception 'Seed account roles do not match.';end if;
 update public.users set name='The Daily Table',location='Clifton, Karachi',lat=24.8138,lng=67.0304,capacity=50 where id=rest;
 update public.users set name='Dastarkhwan Collective',location='Saddar, Karachi',lat=24.855,lng=67.025,capacity=80 where id=ngo;
 update public.users set name='Ayesha Khan',location='DHA, Karachi',lat=24.807,lng=67.055,capacity=20 where id=vol;
 insert into public.donations(restaurant_id,food_name,category,image_url,quantity,pickup_at,expires_at,location,lat,lng,description) values
 (rest,'Vegetable biryani','Prepared meals','https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80',32,now()-interval '10 minutes',now()+interval '110 minutes','Clifton, Karachi',24.8138,67.0304,'Vegetable biryani in individual containers. Contains dairy. Confirm ingredients and storage with the kitchen.'),
 (rest,'Sourdough & pastries','Bakery','https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',18,now()-interval '10 minutes',now()+interval '5 hours','Clifton, Karachi',24.8138,67.0304,'Assorted bread and pastries. Contains wheat, dairy and eggs.'),
 (rest,'Seasonal produce boxes','Produce','https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',24,now()-interval '10 minutes',now()+interval '14 hours','Clifton, Karachi',24.8138,67.0304,'Seasonal vegetables and fruit. Bring reusable crates.');
end $$;
commit;
