import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
// Minimal Supabase fixture: actual PostgreSQL RLS, PL/pgSQL, triggers and grants.
// Hosted Auth, Storage binary uploads and network behavior still need a real-project smoke test.
test("database enforces roles, atomic reservations, ownership and once-only rewards", async () => {
  const db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`);
  await db.exec(readFileSync("supabase/schema.sql", "utf8"));
  const ids = {
    restaurant: "00000000-0000-4000-8000-000000000001",
    ngo: "00000000-0000-4000-8000-000000000002",
    volunteer: "00000000-0000-4000-8000-000000000003",
    otherNgo: "00000000-0000-4000-8000-000000000004",
    otherVol: "00000000-0000-4000-8000-000000000005",
  };
  for (const [name, id] of Object.entries(ids))
    await db.query("insert into auth.users values($1,$2,$3::jsonb)", [
      id,
      `${name}@example.com`,
      JSON.stringify({
        name,
        role: name.includes("Ngo")
          ? "ngo"
          : name.includes("Vol")
            ? "volunteer"
            : name,
      }),
    ]);
  async function as(id: string) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  await as(ids.restaurant);
  const inserted = await db.query<{ id: string }>(
    `insert into public.donations(restaurant_id,food_name,category,quantity,pickup_at,expires_at,location,lat,lng,description) values($1,'Biryani','Prepared meals',32,now()-interval '1 minute',now()+interval '1 hour','Clifton',24.8,67,'Contains dairy') returning id`,
    [ids.restaurant],
  );
  const d = inserted.rows[0].id;
  await assert.rejects(
    db.query("update public.users set role='ngo' where id=$1", [
      ids.restaurant,
    ]),
  );
  await assert.rejects(
    db.query("update public.donations set status='completed' where id=$1", [d]),
  );
  await assert.rejects(
    db.query(
      "insert into public.points(user_id,donation_id,amount,reason) values($1,$2,999,'Pickup')",
      [ids.restaurant, d],
    ),
  );
  await assert.rejects(
    db.query("select public.transition_donation('reserve',$1)", [d]),
  );
  await as(ids.ngo);
  await db.query("select public.transition_donation('reserve',$1)", [d]);
  await as(ids.otherNgo);
  await assert.rejects(
    db.query("select public.transition_donation('reserve',$1)", [d]),
  );
  await assert.rejects(
    db.query("select public.transition_donation('confirm',$1)", [d]),
  );
  await as(ids.volunteer);
  await assert.rejects(
    db.query("select public.transition_donation('deliver',$1)", [d]),
  );
  await db.query("select public.transition_donation('accept',$1)", [d]);
  await as(ids.ngo);
  await assert.rejects(
    db.query("select public.transition_donation('confirm',$1)", [d]),
  );
  await as(ids.otherVol);
  await assert.rejects(
    db.query("select public.transition_donation('collect',$1)", [d]),
  );
  await as(ids.volunteer);
  await db.query("select public.transition_donation('collect',$1)", [d]);
  await assert.rejects(
    db.query("select public.transition_donation('collect',$1)", [d]),
  );
  await db.query("select public.transition_donation('deliver',$1)", [d]);
  await assert.rejects(
    db.query("select public.transition_donation('deliver',$1)", [d]),
  );
  const reward = await db.query<{ amount: number }>(
    "select amount from public.points where user_id=$1 order by amount",
    [ids.volunteer],
  );
  assert.deepEqual(
    reward.rows.map((r) => r.amount),
    [10, 25],
  );
  const donor = await db.query<{ amount: number }>(
    "select amount from public.points where user_id=$1",
    [ids.restaurant],
  );
  assert.equal(donor.rows[0].amount, 50);
  const analytics = await db.query<{ meals: number }>(
    "select meals from public.analytics where donation_id=$1",
    [d],
  );
  assert.equal(analytics.rows[0].meals, 32);
  // Anonymous reads are denied, including profiles and donation history.
  await db.exec("reset role;set role anon");
  await assert.rejects(db.query("select * from public.users"));
  await assert.rejects(db.query("select * from public.donations"));
  // Each user's quota is atomic and capped. No service-role key exists in this app.
  await as(ids.restaurant);
  for (let i = 0; i < 10; i++) {
    const q = await db.query<{ allowed: boolean }>(
      "select public.consume_ai_quota() as allowed",
    );
    assert.equal(q.rows[0].allowed, true);
  }
  const q = await db.query<{ allowed: boolean }>(
    "select public.consume_ai_quota() as allowed",
  );
  assert.equal(q.rows[0].allowed, false);
  await db.close();
});
