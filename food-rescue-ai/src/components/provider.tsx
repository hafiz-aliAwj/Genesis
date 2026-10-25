"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Data,
  Profile,
  Role,
  Donation,
  demoData,
  donationPoints,
  urgency,
} from "@/lib/domain";
import { supabase, live } from "@/lib/supabase";
type Action = "reserve" | "accept" | "collect" | "deliver" | "confirm";
type Store = {
  data: Data;
  user: Profile | null;
  ready: boolean;
  error: string;
  setError: (s: string) => void;
  login: (
    email: string,
    password: string,
    role?: Role,
    name?: string,
  ) => Promise<boolean>;
  demoLogin: (role: Role) => void;
  logout: () => Promise<void>;
  act: (action: Action, id: string) => Promise<void>;
  create: (
    d: Omit<Donation, "id" | "restaurant_id" | "status" | "created_at">,
  ) => Promise<void>;
  saveProfile: (p: Partial<Profile>) => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
};
const empty: Data = {
  users: [],
  donations: [],
  reservations: [],
  volunteer_tasks: [],
  points: [],
  notifications: [],
};
const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw Error("Missing provider");
  return s;
};
export function Provider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(empty),
    [user, setUser] = useState<Profile | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const refreshSeq = useRef(0);
  const refresh = useCallback(async () => {
    if (!supabase) return;
    const seq = ++refreshSeq.current;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      setData(empty);
      return;
    }
    const tables = [
      "users",
      "donations",
      "reservations",
      "volunteer_tasks",
      "points",
      "notifications",
    ] as const;
    const results = await Promise.all(
      tables.map((t) => supabase!.from(t).select("*")),
    );
    if (seq !== refreshSeq.current) return;
    const failure = results.find((r) => r.error);
    if (failure?.error) throw Error(failure.error.message);
    const next = Object.fromEntries(
      tables.map((t, i) => [t, results[i].data || []]),
    ) as Data;
    setData(next);
    setUser(next.users.find((u) => u.id === session.user.id) || null);
  }, []);
  useEffect(() => {
    if (!live) {
      try {
        const stored = localStorage.getItem("food-rescue-v1");
        const next: Data = stored ? JSON.parse(stored) : demoData();
        setData(next);
        const id = localStorage.getItem("food-rescue-user");
        setUser(next.users.find((u) => u.id === id) || null);
      } catch {
        setData(demoData());
      }
      setReady(true);
      return;
    }
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
    const { data: sub } = supabase!.auth.onAuthStateChange(() => {
      setTimeout(() => refresh().catch((e) => setError(e.message)), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);
  useEffect(() => {
    if (ready && !live) {
      try {
        localStorage.setItem("food-rescue-v1", JSON.stringify(data));
        if (user) localStorage.setItem("food-rescue-user", user.id);
        else localStorage.removeItem("food-rescue-user");
      } catch {
        setError(
          "Device storage is full. Use a smaller image or reset the demo.",
        );
      }
    }
  }, [data, user, ready]);
  useEffect(() => {
    if (!live || !user) return;
    const tick = setInterval(
      () => refresh().catch((e) => setError(e.message)),
      10000,
    );
    return () => clearInterval(tick);
  }, [user?.id, refresh]);
  async function login(
    email: string,
    password: string,
    role?: Role,
    name?: string,
  ) {
    if (!supabase)
      throw Error(
        "Use a presentation role below. Real accounts require Supabase.",
      );
    if (role) {
      const { data: r, error: e } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name },
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });
      if (e) throw e;
      if (!r.session) {
        setError("Account created. Check your email to confirm, then log in.");
        return false;
      }
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (e) throw e;
    }
    await refresh();
    return true;
  }
  function demoLogin(role: Role) {
    if (live) return;
    setUser(data.users.find((u) => u.id === `demo-${role}`)!);
  }
  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    if (live) setData(empty);
  }
  async function act(action: Action, id: string) {
    if (!user) throw Error("Please sign in.");
    if (supabase) {
      const { error: e } = await supabase.rpc("transition_donation", {
        p_action: action,
        p_donation: id,
      });
      if (e) throw Error(e.message);
      await refresh();
      return;
    }
    const copy: Data = structuredClone(data);
    const d = copy.donations.find((d) => d.id === id);
    if (!d) throw Error("Donation not found.");
    const t = copy.volunteer_tasks.find((t) => t.donation_id === id);
    const r = copy.reservations.find((r) => r.donation_id === id);
    if (action === "reserve") {
      if (
        user.role !== "ngo" ||
        d.status !== "available" ||
        urgency(d.expires_at) === "Expired"
      )
        throw Error("This food is no longer available.");
      d.status = "reserved";
      copy.reservations.push({
        id: crypto.randomUUID(),
        donation_id: id,
        ngo_id: user.id,
        status: "reserved",
      });
      copy.volunteer_tasks.push({
        id: crypto.randomUUID(),
        donation_id: id,
        volunteer_id: null,
        status: "open",
      });
    } else if (action === "accept") {
      if (
        user.role !== "volunteer" ||
        !t ||
        t.status !== "open" ||
        urgency(d.expires_at) === "Expired"
      )
        throw Error("Task is unavailable.");
      t.volunteer_id = user.id;
      t.status = "accepted";
    } else if (action === "collect") {
      if (
        !t ||
        t.volunteer_id !== user.id ||
        t.status !== "accepted" ||
        +new Date(d.pickup_at) > Date.now() ||
        urgency(d.expires_at) === "Expired"
      )
        throw Error(
          "Pickup is unavailable or the pickup window has not started.",
        );
      t.status = "collected";
      d.status = "collected";
      copy.points.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        donation_id: id,
        amount: 10,
        reason: "Pickup",
      });
    } else if (action === "deliver" || action === "confirm") {
      if (action === "deliver") {
        if (!t || t.volunteer_id !== user.id || t.status !== "collected")
          throw Error("Collect food before delivery.");
        t.status = "delivered";
        copy.points.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          donation_id: id,
          amount: urgency(d.expires_at) === "High" ? 25 : 15,
          reason: "Delivery",
        });
      } else {
        if (
          !r ||
          r.ngo_id !== user.id ||
          d.status !== "reserved" ||
          (t && t.status !== "open") ||
          +new Date(d.pickup_at) > Date.now() ||
          urgency(d.expires_at) === "Expired"
        )
          throw Error(
            "Self-pickup unavailable. An assigned volunteer must complete delivery.",
          );
        copy.volunteer_tasks = copy.volunteer_tasks.filter(
          (x) => x.donation_id !== id,
        );
      }
      d.status = "completed";
      if (r) r.status = "completed";
      copy.points.push({
        id: crypto.randomUUID(),
        user_id: d.restaurant_id,
        donation_id: id,
        amount: donationPoints(d.quantity),
        reason: "Donation completed",
      });
    }
    copy.notifications.unshift({
      id: crypto.randomUUID(),
      user_id: d.restaurant_id,
      message: `${d.food_name}: ${action === "confirm" ? "pickup confirmed" : action}`,
      created_at: new Date().toISOString(),
    });
    setData(copy);
  }
  async function create(
    d: Omit<Donation, "id" | "restaurant_id" | "status" | "created_at">,
  ) {
    if (!user || user.role !== "restaurant")
      throw Error("Restaurant access required.");
    if (supabase) {
      const { error: e } = await supabase
        .from("donations")
        .insert({ ...d, restaurant_id: user.id });
      if (e) throw e;
      await refresh();
    } else
      setData((v) => ({
        ...v,
        donations: [
          {
            ...d,
            id: crypto.randomUUID(),
            restaurant_id: user.id,
            status: "available",
            created_at: new Date().toISOString(),
          },
          ...v.donations,
        ],
      }));
  }
  async function saveProfile(p: Partial<Profile>) {
    if (!user) return;
    const { name, location, lat, lng, capacity } = p;
    const safe = { name, location, lat, lng, capacity };
    if (supabase) {
      const { error: e } = await supabase
        .from("users")
        .update(safe)
        .eq("id", user.id);
      if (e) throw e;
      await refresh();
    } else {
      const u = { ...user, ...safe } as Profile;
      setUser(u);
      setData((d) => ({
        ...d,
        users: d.users.map((x) => (x.id === u.id ? u : x)),
      }));
    }
  }
  function reset() {
    if (live) return;
    setData(demoData());
    setUser(null);
    setError("");
  }
  return (
    <Ctx.Provider
      value={{
        data,
        user,
        ready,
        error,
        setError,
        login,
        demoLogin,
        logout,
        act,
        create,
        saveProfile,
        reset,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
