"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Leaf,
  LayoutDashboard,
  UtensilsCrossed,
  HeartHandshake,
  Bike,
  MapPin,
  Clock,
  Plus,
  Search,
  SlidersHorizontal,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Check,
  ChevronRight,
  Package,
  Flame,
  Globe,
  ShieldCheck,
  Camera,
  Loader2,
  Bell,
  RefreshCw,
  ExternalLink,
  Sprout,
  Truck,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Provider, useStore } from "./provider";
import {
  Donation,
  Role,
  categories,
  urgency,
  match,
  impact,
  badge,
  Profile,
} from "@/lib/domain";
import { live, supabase } from "@/lib/supabase";
const roleNames: Record<Role, string> = {
  restaurant: "Restaurant",
  ngo: "NGO",
  volunteer: "Volunteer",
};
const roleIcons = {
  restaurant: UtensilsCrossed,
  ngo: HeartHandshake,
  volunteer: Bike,
};
const short = (s: string) =>
  new Date(s).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Provider>
        <Routes />
      </Provider>
    </MotionConfig>
  );
}
function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Food Rescue AI home">
      <span className="brand-mark">
        <Sprout size={22} />
      </span>
      <span>
        foodrescue<span className="brand-ai">AI</span>
      </span>
    </Link>
  );
}
function Routes() {
  const [, setClock] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClock((c) => c + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  const path = usePathname();
  const { error, setError } = useStore();
  return (
    <>
      <div aria-live="polite">
        {error && (
          <div className="toast" role="alert">
            <span>{error}</span>
            <button aria-label="Dismiss message" onClick={() => setError("")}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>
      {path === "/" ? (
        <Landing />
      ) : path === "/about" ? (
        <About />
      ) : path === "/login" || path === "/signup" ? (
        <Auth signup={path === "/signup"} />
      ) : (
        <Shell />
      )}
    </>
  );
}
function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-nav wrap">
      <Brand />
      <nav className={open ? "public-links open" : "public-links"}>
        <Link href="/about">The mission</Link>
        <Link href="/impact">Our impact</Link>
        <Link href="/leaderboard">Community</Link>
        <Link href="/login">Log in</Link>
        <Button asChild size="sm">
          <Link href="/signup">
            Join the movement <ArrowUpRight size={16} />
          </Link>
        </Button>
      </nav>
      <button
        className="mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
function Landing() {
  return (
    <>
      <PublicNav />
      <main>
        <section className="hero wrap">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-copy"
          >
            <span className="eyebrow">
              <span className="status-dot" /> LESS WASTE. MORE POSSIBILITY.
            </span>
            <h1>
              Good food.
              <br />
              Not <span className="serif">goodbye.</span>
            </h1>
            <p>
              A second chance for surplus food. A stronger community for
              everyone. Connect your kitchen to the people who need it, while
              it’s still fresh.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/signup">
                  Start rescuing food <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">
                  Explore the live demo <ArrowRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="hero-note">
              <ShieldCheck size={17} /> Free to join. Built around your
              neighbourhood.
            </div>
          </motion.div>
          <motion.div
            className="hero-art"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <img
              src="/images/produce.jpg"
              alt="Fresh vegetables ready to be shared with the community"
            />
            <div className="image-shade" />
            <div className="hero-photo-label">
              <span className="tag">A LITTLE EXTRA CAN GO A LONG WAY</span>
              <p>
                From your kitchen.
                <br />
                To someone’s next meal.
              </p>
            </div>
            <div className="rescue-ticket">
              <span className="ticket-icon">
                <Check size={22} />
              </span>
              <div>
                <strong>Nothing good goes to waste.</strong>
                <small>List it. Match it. Make a difference.</small>
              </div>
              <ArrowUpRight size={21} />
            </div>
          </motion.div>
        </section>
        <section className="principles wrap">
          <div>
            <strong>01 / LIST</strong>
            <p>
              A few details.
              <br />A whole lot of good.
            </p>
          </div>
          <div>
            <strong>02 / CONNECT</strong>
            <p>
              Find a nearby NGO.
              <br />
              Not another landfill.
            </p>
          </div>
          <div>
            <strong>03 / RESCUE</strong>
            <p>
              Local volunteers.
              <br />
              Real-world impact.
            </p>
          </div>
          <div className="principles-last">
            <Leaf size={28} />
            <span>
              Better for people.
              <br />
              Lighter on the planet.
            </span>
          </div>
        </section>
        <section className="how wrap">
          <div>
            <span className="eyebrow">ONE NETWORK. THREE WAYS TO HELP.</span>
            <h2>
              There’s a place
              <br />
              for you at this table.
            </h2>
          </div>
          <div className="role-cards">
            {(["restaurant", "ngo", "volunteer"] as Role[]).map((r, i) => {
              const Icon = roleIcons[r];
              return (
                <Link href="/signup" className="role-card" key={r}>
                  <Icon size={25} />
                  <small>0{i + 1}</small>
                  <h3>{roleNames[r]}s</h3>
                  <p>
                    {r === "restaurant"
                      ? "Turn your surplus into someone’s next meal."
                      : r === "ngo"
                        ? "Find fresh food for the community you serve."
                        : "Be the connection between extra and enough."}
                  </p>
                  <span>
                    Make your first move <ArrowUpRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
function Footer() {
  return (
    <footer className="wrap footer">
      <Brand />
      <p>Good food belongs on a table.</p>
      <Link href="/about">
        About the project <ArrowUpRight size={15} />
      </Link>
    </footer>
  );
}
function About() {
  return (
    <>
      <PublicNav />
      <main className="wrap about">
        <span className="eyebrow">THE MISSION</span>
        <h1>
          Surplus isn’t waste.
          <br />
          It’s an <span className="serif accent">opportunity.</span>
        </h1>
        <p className="intro">
          Food Rescue AI helps restaurants share safe surplus food with local
          organisations, and gives volunteers a simple way to move it.
        </p>
        <div className="three-grid">
          <article className="panel">
            <UtensilsCrossed />
            <h3>Built for busy kitchens</h3>
            <p>
              List food, set a pickup window, and keep an accurate record of
              completed donations.
            </p>
          </article>
          <article className="panel">
            <HeartHandshake />
            <h3>Community, not complexity</h3>
            <p>
              NGOs reserve food based on their capacity. Volunteers take care of
              the last mile.
            </p>
          </article>
          <article className="panel">
            <ShieldCheck />
            <h3>Human judgement first</h3>
            <p>
              Image suggestions do not determine food safety. Donors and
              recipients must verify handling, allergens, temperature and local
              requirements.
            </p>
          </article>
        </div>
        <div className="panel editorial">
          <h2>Intelligence with a clear purpose.</h2>
          <p>
            Explainable matching uses distance, receiving capacity and urgency.
            Optional Gemini image suggestions help write listings. Food safety
            is never predicted from a photograph.
          </p>
          <p>
            Impact figures are estimates: one listed meal is treated as 0.4 kg
            of food, and each kilogram of food as 2.5 kg CO₂e avoided. These are
            configurable demo assumptions, not audited environmental claims.
          </p>
          <Button asChild>
            <Link href="/signup">
              Become a partner <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
function Auth({ signup }: { signup: boolean }) {
  const { login, demoLogin } = useStore();
  const router = useRouter();
  const [role, setRole] = useState<Role>("restaurant"),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const f = new FormData(e.currentTarget);
    try {
      if (
        await login(
          String(f.get("email")),
          String(f.get("password")),
          signup ? role : undefined,
          String(f.get("name") || ""),
        )
      )
        router.push("/dashboard");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">SMALL ACTION. SHARED IMPACT.</span>
          <h1>
            Be someone’s
            <br />
            <span className="serif">good news.</span>
          </h1>
          <p>
            Every rescue begins with a connection.
            <br />
            Let’s make yours.
          </p>
        </div>
        <span className="muted">Fresh possibilities. Every day.</span>
      </section>
      <section className="auth-form">
        <Link href="/" className="back-link">
          ← Back to home
        </Link>
        <div>
          <span className="eyebrow">WELCOME TO THE TABLE</span>
          <h2>{signup ? "Make room for good." : "Good to see you."}</h2>
          <p>
            {signup
              ? "Create an account to start making a difference."
              : "Your neighbourhood is ready when you are."}
          </p>
          {live ? (
            <form onSubmit={submit}>
              {signup && (
                <>
                  <label>
                    Organisation / full name
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="organization"
                    />
                  </label>
                  <fieldset>
                    <legend>I’m joining as a</legend>
                    <div className="role-picker">
                      {(["restaurant", "ngo", "volunteer"] as Role[]).map(
                        (r) => (
                          <button
                            type="button"
                            key={r}
                            aria-pressed={role === r}
                            className={role === r ? "selected" : ""}
                            onClick={() => setRole(r)}
                          >
                            {roleNames[r]}
                          </button>
                        ),
                      )}
                    </div>
                  </fieldset>
                </>
              )}
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={signup ? "new-password" : "current-password"}
                />
              </label>
              {!signup && (
                <button
                  type="button"
                  className="text-button"
                  onClick={async () => {
                    const email = prompt(
                      "Enter your account email. A recovery link will be sent.",
                    );
                    if (!email) return;
                    const { error } =
                      await supabase!.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin + "/settings",
                      });
                    setErr(
                      error
                        ? error.message
                        : "Recovery email sent. Open the link, then set a new password in Settings.",
                    );
                  }}
                >
                  Forgot password?
                </button>
              )}
              {err && (
                <p className="form-error" role="alert">
                  {err}
                </p>
              )}
              <Button disabled={busy} type="submit">
                {busy ? (
                  <Loader2 className="spin" size={18} />
                ) : signup ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
                <ArrowRight size={17} />
              </Button>
            </form>
          ) : (
            <div className="demo-login">
              <div className="notice">
                <Globe size={20} />
                <div>
                  <strong>Presentation mode · no keys needed</strong>
                  <p>
                    Try all three roles on this device. Switch roles to follow a
                    rescue from listing to delivery. Each device has its own
                    demo.
                  </p>
                </div>
              </div>
              {(["restaurant", "ngo", "volunteer"] as Role[]).map((r) => {
                const Icon = roleIcons[r];
                return (
                  <button
                    className="demo-role"
                    key={r}
                    onClick={() => {
                      demoLogin(r);
                      router.push("/dashboard");
                    }}
                  >
                    <Icon size={23} />
                    <span>
                      <strong>Continue as {roleNames[r]}</strong>
                      <small>
                        {r === "restaurant"
                          ? "The Daily Table"
                          : r === "ngo"
                            ? "Dastarkhwan Collective"
                            : "Ayesha Khan"}
                      </small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                );
              })}
            </div>
          )}
          <p className="auth-switch">
            {signup ? "Already part of the community?" : "New around here?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Log in" : "Join us"}
            </Link>
          </p>
        </div>
        <small className="muted">
          By joining, you agree to handle food safely and respect your
          community.
        </small>
      </section>
    </main>
  );
}
function Shell() {
  const { user, ready, logout, data, refresh, setError } = useStore();
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [notices, setNotices] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = document.querySelector(".sidebar") as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    controls()[0]?.focus();
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = controls(),
        first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (ready && !user && !["/impact", "/leaderboard"].includes(path))
      router.replace("/login");
  }, [ready, user, path, router]);
  if (!ready)
    return (
      <main className="loading">
        <Loader2 className="spin" /> Loading your neighbourhood…
      </main>
    );
  if (!user && live)
    return (
      <main className="loading">
        <div>
          <h2>Join the rescue network.</h2>
          <p style={{ margin: "16px 0" }}>
            Sign in to view community impact and activity.
          </p>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  if (!user && !["/impact", "/leaderboard"].includes(path))
    return <main className="loading">Taking you to sign in…</main>;
  const nav = [
    ["/dashboard", "Overview", LayoutDashboard],
    [
      "/donations",
      user?.role === "restaurant"
        ? "My donations"
        : user?.role === "volunteer"
          ? "Deliveries"
          : "Find food",
      user?.role === "volunteer" ? Bike : UtensilsCrossed,
    ],
    ["/impact", "Our impact", Leaf],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/settings", "Settings", Settings],
  ] as const;
  const myNotices = data.notifications.filter((n) => n.user_id === user?.id);
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="mobile-toggle"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <span className="nav-caption">YOUR COMMUNITY</span>
        <nav>
          {nav.map(([url, label, Icon]) => (
            <Link
              className={
                path === url ||
                (url === "/donations" && path.startsWith("/donations/"))
                  ? "nav-item active"
                  : "nav-item"
              }
              href={url}
              key={url}
            >
              <Icon size={19} />
              {label}
              {path === url && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={26} />
            <strong>
              Good things grow
              <br />
              when we share.
            </strong>
            <span>One rescue at a time.</span>
          </div>
          {user ? (
            <>
              <div className="user-chip">
                <span className="avatar">{user.name.slice(0, 1)}</span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{roleNames[user.role]} partner</small>
                </div>
              </div>
              <button
                className="nav-item"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <LogOut size={18} /> {live ? "Sign out" : "Switch demo role"}
              </button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Join the community</Link>
            </Button>
          )}
        </div>
      </aside>
      {open && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>
              <span className="muted">Workspace</span>
              <ChevronRight size={14} />
              {user ? roleNames[user.role] : "Community"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="mode-tag">
              <span className="status-dot" />
              {live ? "Connected · 10s refresh" : "Demo · device-local"}
            </span>
            {live && (
              <button
                title="Refresh data"
                aria-label="Refresh data"
                onClick={() => refresh().catch((e) => setError(e.message))}
              >
                <RefreshCw size={18} />
              </button>
            )}
            <button
              aria-label="Notifications"
              aria-expanded={notices}
              onClick={() => setNotices(!notices)}
            >
              <Bell size={20} />
              {myNotices.length > 0 && <span className="notification-dot" />}
            </button>
          </div>
          {notices && (
            <div className="notification-panel">
              <strong>Latest updates</strong>
              {myNotices.length ? (
                myNotices.slice(0, 6).map((n) => (
                  <p key={n.id}>
                    {n.message}
                    <small>{short(n.created_at)}</small>
                  </p>
                ))
              ) : (
                <p>You’re all caught up.</p>
              )}
            </div>
          )}
        </header>
        <main className="app-content">
          {!live && (
            <div className="demo-strip">
              <span>Presentation workspace</span> Seeded examples · changes stay
              on this browser · no real food requests
            </div>
          )}
          {user?.location === "Set your address in Settings" && (
            <div className="notice" style={{ marginBottom: 24 }}>
              <MapPin size={20} />
              <p>
                Add your address, coordinates and capacity in{" "}
                <Link className="accent" href="/settings">
                  Settings
                </Link>{" "}
                before arranging a rescue. Matching requires a real location.
              </p>
            </div>
          )}
          {path === "/dashboard" ? (
            <Dashboard />
          ) : path === "/donations/new" ? (
            <DonationForm />
          ) : path.startsWith("/donations/") ? (
            <Details id={path.split("/")[2]} />
          ) : path === "/donations" ? (
            <Browse />
          ) : path === "/impact" ? (
            <Impact />
          ) : path === "/leaderboard" ? (
            <Leaderboard />
          ) : path === "/settings" ? (
            <SettingsPage />
          ) : (
            <div className="empty">
              <h2>We couldn’t find that page.</h2>
              <Link href="/dashboard">Back to overview</Link>
            </div>
          )}
        </main>
        <div className="workspace-footer">
          Made for the neighbourhood. <Leaf size={13} /> Every meal matters.
        </div>
      </div>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Leaf;
}) {
  return (
    <article className="stat">
      <div>
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function Dashboard() {
  const { user, data } = useStore();
  if (!user) return null;
  const own = data.donations.filter((d) => d.restaurant_id === user.id),
    points = data.points
      .filter((p) => p.user_id === user.id)
      .reduce((a, p) => a + p.amount, 0),
    stats = impact(own);
  const reserved = data.reservations.filter((r) => r.ngo_id === user.id);
  const tasks = data.volunteer_tasks.filter((t) => t.volunteer_id === user.id);
  const available = data.donations.filter(
    (d) => d.status === "available" && urgency(d.expires_at) !== "Expired",
  );
  const rank =
    [...data.users.filter((u) => u.role === "volunteer")]
      .sort(
        (a, b) =>
          data.points
            .filter((p) => p.user_id === b.id)
            .reduce((a, p) => a + p.amount, 0) -
          data.points
            .filter((p) => p.user_id === a.id)
            .reduce((a, p) => a + p.amount, 0),
      )
      .findIndex((u) => u.id === user.id) + 1;
  return (
    <>
      <Heading
        eyebrow="GOOD FOOD. BETTER FUTURES."
        title={
          user.role === "restaurant"
            ? "Your kitchen. A little kinder."
            : user.role === "ngo"
              ? "Good food is close by."
              : "Be the good in someone’s day."
        }
        description={`Welcome back, ${user.name}. Let’s make today count.`}
        action={
          user.role === "restaurant" ? (
            <Button asChild>
              <Link href="/donations/new">
                <Plus size={18} /> Create donation
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/donations">
                {user.role === "ngo"
                  ? "Find available food"
                  : "Find a delivery"}
                <ArrowUpRight size={18} />
              </Link>
            </Button>
          )
        }
      />
      <section className="stats-grid">
        {user.role === "restaurant" ? (
          <>
            <Stat
              label="Total donations"
              value={own.length}
              note={`${own.filter((d) => d.status === "available").length} available right now`}
              icon={Package}
            />
            <Stat
              label="Food saved"
              value={`${stats.kg.toFixed(1)} kg`}
              note={`${stats.meals} meals completed`}
              icon={Leaf}
            />
            <Stat
              label="Points earned"
              value={points}
              note={badge(user.role, points)}
              icon={Trophy}
            />
            <Stat
              label="Impact score"
              value={`${stats.score}/100`}
              note="1 point per 5 meals · max 100"
              icon={Globe}
            />
          </>
        ) : user.role === "ngo" ? (
          <>
            <Stat
              label="Available food"
              value={available.length}
              note="Fresh listings in the network"
              icon={UtensilsCrossed}
            />
            <Stat
              label="Reserved food"
              value={reserved.filter((r) => r.status === "reserved").length}
              note="Ready to coordinate pickup"
              icon={Package}
            />
            <Stat
              label="Completed pickups"
              value={reserved.filter((r) => r.status === "completed").length}
              note="Meals brought to your community"
              icon={CheckCircle2}
            />
            <Stat
              label="Receiving capacity"
              value={user.capacity}
              note="Meals per rescue · edit in Settings"
              icon={Users}
            />
          </>
        ) : (
          <>
            <Stat
              label="Available deliveries"
              value={
                data.volunteer_tasks.filter(
                  (t) =>
                    t.status === "open" &&
                    data.donations.some(
                      (d) =>
                        d.id === t.donation_id &&
                        urgency(d.expires_at) !== "Expired",
                    ),
                ).length
              }
              note="Make a connection today"
              icon={Bike}
            />
            <Stat
              label="Points earned"
              value={points}
              note={badge(user.role, points)}
              icon={Trophy}
            />
            <Stat
              label="Your ranking"
              value={`#${rank}`}
              note="Among registered volunteers"
              icon={Flame}
            />
            <Stat
              label="Delivered"
              value={tasks.filter((t) => t.status === "delivered").length}
              note="Completed community deliveries"
              icon={CheckCircle2}
            />
          </>
        )}
      </section>
      <section className="mission-banner">
        <div>
          <span className="eyebrow">THE NEXT GOOD THING</span>
          <h2>
            {user.role === "restaurant"
              ? "Your surplus has a better destination."
              : user.role === "ngo"
                ? "A table filled. A community nourished."
                : "A short trip can make a big difference."}
          </h2>
          <p>
            {user.role === "restaurant"
              ? "Share what’s fresh. We’ll help it find a home."
              : "Find the next rescue in your neighbourhood."}
          </p>
          <Link
            href={user.role === "restaurant" ? "/donations/new" : "/donations"}
          >
            {user.role === "restaurant"
              ? "List your surplus"
              : "Explore opportunities"}{" "}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mission-stamp">
          <Sprout size={40} />
          <span>
            LOCAL FOOD.
            <br />
            SHARED FUTURES.
          </span>
        </div>
      </section>
      <Browse embedded />
      <section className="bottom-grid">
        <div className="panel">
          <span className="eyebrow">YOUR RECOGNITION</span>
          <div className="badge-feature">
            <span className="badge-medal">
              <Trophy size={28} />
            </span>
            <div>
              <h3>{badge(user.role, points)}</h3>
              <p>
                {user.role === "ngo"
                  ? "Your community is the reason we’re here."
                  : `${points} points earned through real, completed actions.`}
              </p>
            </div>
          </div>
          <Link className="inline-link" href="/leaderboard">
            Meet the community <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="panel safety-note">
          <ShieldCheck size={24} />
          <h3>Freshness is a shared responsibility.</h3>
          <p>
            Always confirm allergens, safe storage and expiry with the donor.
            Never use AI as a food safety check.
          </p>
        </div>
      </section>
    </>
  );
}
function Browse({ embedded = false }: { embedded?: boolean }) {
  const { data, user } = useStore();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All categories"),
    [tab, setTab] = useState("All"),
    [sort, setSort] = useState("Urgency");
  let rows = data.donations
    .filter((d) => {
      if (user?.role === "restaurant") return d.restaurant_id === user.id;
      if (user?.role === "volunteer")
        return data.volunteer_tasks.some(
          (t) =>
            t.donation_id === d.id &&
            (t.status === "open" || t.volunteer_id === user.id),
        );
      return (
        d.status === "available" ||
        data.reservations.some(
          (r) => r.donation_id === d.id && r.ngo_id === user?.id,
        )
      );
    })
    .filter(
      (d) =>
        d.food_name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All categories" || d.category === category),
    );
  if (tab === "Active")
    rows = rows.filter(
      (d) => d.status !== "completed" && urgency(d.expires_at) !== "Expired",
    );
  if (tab === "Completed") rows = rows.filter((d) => d.status === "completed");
  if (tab === "Reserved")
    rows = rows.filter((d) =>
      data.reservations.some(
        (r) => r.donation_id === d.id && r.ngo_id === user?.id,
      ),
    );
  if (tab === "Available")
    rows = rows.filter(
      (d) => d.status === "available" && urgency(d.expires_at) !== "Expired",
    );
  rows.sort((a, b) =>
    sort === "Distance" && user
      ? match(a, user).km - match(b, user).km
      : sort === "Quantity"
        ? b.quantity - a.quantity
        : +new Date(a.expires_at) - +new Date(b.expires_at),
  );
  if (embedded)
    rows = rows
      .filter(
        (d) => d.status !== "completed" && urgency(d.expires_at) !== "Expired",
      )
      .slice(0, 3);
  const title =
    user?.role === "restaurant"
      ? "Your donations"
      : user?.role === "volunteer"
        ? "Rescue deliveries"
        : "Find your next rescue";
  return (
    <section className="listing-section">
      {!embedded ? (
        <Heading
          eyebrow="THE RESCUE NETWORK"
          title={title}
          description="A little coordination. A meaningful difference."
          action={
            user?.role === "restaurant" ? (
              <Button asChild>
                <Link href="/donations/new">
                  <Plus size={18} /> Create donation
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="section-heading">
          <div>
            <h2>
              {user?.role === "restaurant"
                ? "Active donations"
                : user?.role === "volunteer"
                  ? "Deliveries near you"
                  : "Fresh from the neighbourhood"}
            </h2>
            <p>
              {user?.role === "restaurant"
                ? "Good food, on its way to doing good."
                : "Time-sensitive opportunities to make a difference."}
            </p>
          </div>
          <Link href="/donations" className="inline-link">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {!embedded && (
        <>
          <div className="tabs">
            {(user?.role === "ngo"
              ? ["All", "Available", "Reserved", "Completed"]
              : ["All", "Active", "Completed"]
            ).map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="filters">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="Search food"
                placeholder="Search food or meals…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="select-field">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Filter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["All categories", ...categories].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <select
              aria-label="Sort listings"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {["Urgency", "Distance", "Quantity"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </>
      )}
      {rows.length ? (
        <div className="donation-grid">
          {rows.map((d) => (
            <DonationCard key={d.id} d={d} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Sprout size={35} />
          <h3>
            {user?.role === "volunteer"
              ? "No deliveries here yet."
              : "No matching donations yet."}
          </h3>
          <p>
            {user?.role === "volunteer"
              ? "An NGO reservation creates a delivery opportunity."
              : "Try a different filter or create the first donation."}
          </p>
          {user?.role === "restaurant" && (
            <Button asChild>
              <Link href="/donations/new">Create a donation</Link>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
function FoodImage({ d }: { d: Donation }) {
  const [failed, setFailed] = useState(false);
  return failed || !d.image_url ? (
    <div className="food-placeholder">
      <UtensilsCrossed size={42} />
      <span>{d.category}</span>
    </div>
  ) : (
    <img src={d.image_url} alt={d.food_name} onError={() => setFailed(true)} />
  );
}
function DonationCard({ d }: { d: Donation }) {
  const { user, data } = useStore();
  const u = urgency(d.expires_at),
    donor = data.users.find((p) => p.id === d.restaurant_id);
  return (
    <Link href={"/donations/" + d.id} className="donation-card">
      <div className="food-image">
        <FoodImage d={d} />
        <span
          className={`food-status ${d.status === "completed" ? "completed" : u.toLowerCase()}`}
        >
          {d.status === "completed" ? (
            <Check size={13} />
          ) : u === "High" ? (
            <Flame size={13} />
          ) : (
            <Clock size={13} />
          )}{" "}
          {d.status === "completed"
            ? "Completed"
            : d.status !== "available"
              ? d.status
              : u === "Expired"
                ? "Expired"
                : u === "High"
                  ? "Rescue soon"
                  : u === "Medium"
                    ? "Today’s pickup"
                    : "Fresh opportunity"}
        </span>
        <span className="quantity-label">{d.quantity} meals</span>
      </div>
      <div className="food-card-body">
        <div className="card-category">
          {d.category}
          <ArrowUpRight size={16} />
        </div>
        <h3>{d.food_name}</h3>
        <p className="food-donor">{donor?.name || "Community kitchen"}</p>
        <div className="food-meta">
          <span>
            <MapPin size={14} />
            {d.location}
          </span>
          <span>
            <Clock size={14} />
            {d.status === "completed"
              ? "Rescue complete"
              : `Until ${new Date(d.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </span>
        </div>
        <div className="card-footer">
          <span>
            {user && user.role === "ngo"
              ? `${match(d, user).score}% match`
              : "Every meal matters"}
          </span>
          <span>
            View details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
function Details({ id }: { id: string }) {
  const { data, user, act, setError } = useStore();
  const d = data.donations.find((d) => d.id === id);
  const [busy, setBusy] = useState(false);
  if (!d)
    return (
      <div className="empty">
        <h2>Donation not found</h2>
        <p>It may not be available to your account.</p>
        <Link href="/donations">Return to listings</Link>
      </div>
    );
  const task = data.volunteer_tasks.find((t) => t.donation_id === id),
    reservation = data.reservations.find((r) => r.donation_id === id),
    donor = data.users.find((u) => u.id === d.restaurant_id),
    recipient = data.users.find((u) => u.id === reservation?.ngo_id);
  const recommendations = data.users
    .filter(
      (u) => u.role === "ngo" && u.location !== "Set your address in Settings",
    )
    .map((n) => ({ n, ...match(d, n) }))
    .sort((a, b) => b.score - a.score);
  const action =
    user?.role === "ngo"
      ? d.status === "available"
        ? "reserve"
        : reservation?.ngo_id === user.id &&
            d.status === "reserved" &&
            (!task || task.status === "open")
          ? "confirm"
          : null
      : user?.role === "volunteer"
        ? task?.status === "open"
          ? "accept"
          : task?.volunteer_id === user.id
            ? task.status === "accepted"
              ? "collect"
              : task.status === "collected"
                ? "deliver"
                : null
            : null
        : null;
  const actionName = {
    reserve: "Reserve this food",
    confirm: "Confirm self-pickup",
    accept: "Accept pickup",
    collect: "Mark collected",
    deliver: "Mark delivered",
  };
  return (
    <>
      <Link href="/donations" className="back-link">
        ← Back to {user?.role === "volunteer" ? "deliveries" : "donations"}
      </Link>
      <Heading
        eyebrow={d.category.toUpperCase()}
        title={d.food_name}
        description={`Shared by ${donor?.name || "a community kitchen"}`}
      />
      <div className="detail-grid">
        <section>
          <div className="detail-photo">
            <FoodImage d={d} />
          </div>
          <div className="panel detail-description">
            <h2>About this donation</h2>
            <p>{d.description}</p>
            <div className="detail-facts">
              <div>
                <span>Meals available</span>
                <strong>{d.quantity} portions</strong>
              </div>
              <div>
                <span>Pickup from</span>
                <strong>{short(d.pickup_at)}</strong>
              </div>
              <div>
                <span>Use before</span>
                <strong>{short(d.expires_at)}</strong>
              </div>
              <div>
                <span>Urgency</span>
                <strong>{urgency(d.expires_at)}</strong>
              </div>
            </div>
            <h3>
              <MapPin size={18} /> Pickup location
            </h3>
            <p>{d.location}</p>
            <Map lat={d.lat} lng={d.lng} />
            {recipient && (
              <>
                <h3>Delivery destination</h3>
                <p>
                  {recipient.name} · {recipient.location}
                </p>
                <a
                  className="inline-link"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${d.lat}%2C${d.lng}%3B${recipient.lat}%2C${recipient.lng}`}
                >
                  Open pickup-to-dropoff route <ExternalLink size={14} />
                </a>
              </>
            )}
          </div>
        </section>
        <aside className="detail-aside">
          <div className="panel">
            <span className="eyebrow">RESCUE STATUS</span>
            <h2 className="capitalize">{d.status}</h2>
            <ol className="timeline">
              {["available", "reserved", "collected", "completed"].map(
                (s, i) => (
                  <li
                    key={s}
                    className={
                      [
                        "available",
                        "reserved",
                        "collected",
                        "completed",
                      ].indexOf(d.status) >= i
                        ? "done"
                        : ""
                    }
                  >
                    <span>
                      {[
                        "available",
                        "reserved",
                        "collected",
                        "completed",
                      ].indexOf(d.status) >= i ? (
                        <Check size={12} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    {s === "available"
                      ? "Listed by the kitchen"
                      : s === "reserved"
                        ? "Reserved by NGO"
                        : s === "collected"
                          ? "Collected for delivery"
                          : "Rescue completed"}
                  </li>
                ),
              )}
            </ol>
            {action && (
              <Button
                className="full-width"
                disabled={
                  busy ||
                  ((action === "reserve" ||
                    action === "accept" ||
                    action === "collect" ||
                    action === "confirm") &&
                    urgency(d.expires_at) === "Expired")
                }
                onClick={async () => {
                  setBusy(true);
                  try {
                    await act(action, d.id);
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  actionName[action]
                )}{" "}
                <ArrowRight size={16} />
              </Button>
            )}
            {!action && (
              <p className="muted">
                {user?.role === "restaurant"
                  ? "Your community will coordinate the next step."
                  : d.status === "completed"
                    ? "This rescue is complete. Thank you."
                    : "Follow this page for pickup updates."}
              </p>
            )}
          </div>
          <div className="panel">
            <span className="eyebrow">SMART MATCHING · EXPLAINABLE</span>
            <h3>The right food. The right place.</h3>
            {recommendations.length ? (
              recommendations.slice(0, 3).map((r, i) => (
                <div className="match-row" key={r.n.id}>
                  <div>
                    <strong>
                      {r.n.name}
                      {i === 0 && <small>Recommended NGO</small>}
                    </strong>
                    <span>
                      {r.km.toFixed(1)} km away · capacity {r.n.capacity}
                    </span>
                    <small>
                      Distance {Math.round(r.distanceScore * 100)} · capacity{" "}
                      {Math.round(r.quantityScore * 100)} · urgency{" "}
                      {Math.round(r.urgencyScore * 100)}
                    </small>
                  </div>
                  <b>{r.score}%</b>
                </div>
              ))
            ) : (
              <p>No NGOs registered yet.</p>
            )}
            <p className="fine-print">
              50% distance + 30% receiving capacity + 20% urgency. Approximate
              straight-line distance, not travel time. Recommendations don’t
              reserve food automatically.
            </p>
          </div>
          <div className="notice">
            <ShieldCheck size={23} />
            <p>
              Confirm food safety, allergens and transport conditions with the
              donor before pickup.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Map({ lat, lng }: { lat: number; lng: number }) {
  const box = [lng - 0.015, lat - 0.012, lng + 0.015, lat + 0.012].join(",");
  return (
    <div className="map">
      <iframe
        title="Pickup location on OpenStreetMap"
        loading="lazy"
        referrerPolicy="no-referrer"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat},${lng}`}
      />
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
      >
        Open larger map <ExternalLink size={13} />
      </a>
    </div>
  );
}
function DonationForm() {
  const { user, create, setError } = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [analyzing, setAnalyzing] = useState(false),
    [image, setImage] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [food, setFood] = useState(""),
    [desc, setDesc] = useState(""),
    [category, setCategory] = useState(categories[0]),
    [aiNote, setAiNote] = useState("");
  if (!user) return null;
  if (user.role !== "restaurant")
    return (
      <div className="empty">
        <h2>Restaurant access required</h2>
        <Link href="/dashboard">Back to overview</Link>
      </div>
    );
  async function choose(f?: File) {
    if (!f) return;
    if (
      f.size > 4 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(f.type)
    ) {
      setError("Choose a JPG, PNG or WebP image under 4 MB.");
      return;
    }
    setFile(f);
    const source = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    if (live) {
      setImage(source);
    } else {
      const preview = new Image();
      preview.onload = () => {
        const scale = Math.min(
          1,
          1024 / Math.max(preview.width, preview.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = preview.width * scale;
        canvas.height = preview.height * scale;
        canvas
          .getContext("2d")!
          .drawImage(preview, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/jpeg", 0.75));
      };
      preview.onerror = () =>
        setError("This file could not be read as an image.");
      preview.src = source;
    }
  }
  async function analyze() {
    if (!file) return;
    setAnalyzing(true);
    setAiNote("");
    try {
      const { data: session } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      const f = new FormData();
      f.append("image", file);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: f,
        headers: session.session
          ? { Authorization: `Bearer ${session.session.access_token}` }
          : {},
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Image analysis failed.");
      if (result.food_name) setFood(result.food_name);
      if (result.description) setDesc(result.description);
      if (categories.includes(result.category)) setCategory(result.category);
      setAiNote(
        result.notice ||
          "Gemini suggestion applied. Check and edit every detail before publishing.",
      );
    } catch (e) {
      setAiNote((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const pickup = new Date(String(f.get("pickup"))).toISOString(),
        expiry = new Date(String(f.get("expiry"))).toISOString();
      if (
        +new Date(expiry) <= Date.now() ||
        +new Date(expiry) <= +new Date(pickup)
      )
        throw Error("Expiry must be in the future and after pickup.");
      let imageUrl = image;
      if (file && supabase) {
        const ext =
          file.type === "image/jpeg"
            ? "jpg"
            : file.type === "image/png"
              ? "png"
              : "webp";
        const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("food-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        imageUrl = supabase.storage.from("food-images").getPublicUrl(path)
          .data.publicUrl;
      }
      await create({
        food_name: food,
        category,
        description: desc,
        image_url: imageUrl,
        quantity: Number(f.get("quantity")),
        pickup_at: pickup,
        expires_at: expiry,
        location: String(f.get("location")),
        lat: Number(f.get("lat")),
        lng: Number(f.get("lng")),
      });
      router.push("/donations");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const localTime = (h: number) => {
    const d = new Date(Date.now() + h * 3600000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  return (
    <>
      <Link href="/donations" className="back-link">
        ← Back to donations
      </Link>
      <Heading
        eyebrow="A FRESH START"
        title="Give good food a second chance."
        description="Tell your community what’s available. We’ll help with the connection."
      />
      <form className="donation-form" onSubmit={submit}>
        <section className="panel">
          <div className="section-heading">
            <h2>The food</h2>
            <span className="step-label">01 / DETAILS</span>
          </div>
          <label className="image-upload">
            {image ? (
              <img src={image} alt="Donation preview" />
            ) : (
              <>
                <Camera size={30} />
                <strong>Add a photo</strong>
                <span>JPG, PNG or WebP · up to 4 MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => choose(e.target.files?.[0])}
            />
          </label>
          <div className="ai-assist">
            <div>
              <strong>
                <Sprout size={16} /> A little help from AI
              </strong>
              <p>Suggest a food name, category and description.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!file || analyzing}
              onClick={analyze}
            >
              {analyzing ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <Camera size={16} />
              )}{" "}
              Analyze image
            </Button>
          </div>
          {aiNote && (
            <p className="notice ai-note" role="status">
              {aiNote}
            </p>
          )}
          <label>
            Food name
            <input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              maxLength={120}
              required
              placeholder="e.g. Fresh vegetable biryani"
            />
          </label>
          <div className="two-grid">
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity (meal portions)
              <input
                name="quantity"
                type="number"
                min={1}
                max={10000}
                required
                placeholder="e.g. 25"
              />
            </label>
          </div>
          <label>
            Description & allergen information
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Preparation, packaging, storage, ingredients and known allergens…"
            />
          </label>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>The pickup</h2>
            <span className="step-label">02 / LOGISTICS</span>
          </div>
          <div className="two-grid">
            <label>
              Pickup from
              <input
                name="pickup"
                type="datetime-local"
                defaultValue={localTime(0)}
                required
              />
            </label>
            <label>
              Expiry / use before
              <input
                name="expiry"
                type="datetime-local"
                defaultValue={localTime(4)}
                required
              />
            </label>
          </div>
          <label>
            Pickup address
            <input
              name="location"
              required
              defaultValue={user.location}
              maxLength={250}
              placeholder="Street, building and neighbourhood"
            />
          </label>
          <div className="two-grid">
            <label>
              Latitude
              <input
                name="lat"
                type="number"
                step="any"
                min={-90}
                max={90}
                defaultValue={user.lat}
                required
              />
            </label>
            <label>
              Longitude
              <input
                name="lng"
                type="number"
                step="any"
                min={-180}
                max={180}
                defaultValue={user.lng}
                required
              />
            </label>
          </div>
          <p className="fine-print">
            Use precise coordinates from OpenStreetMap. Matching uses these
            coordinates; check them before listing.
          </p>
          <div className="notice">
            <ShieldCheck size={22} />
            <p>
              Only list food that is safe for donation. AI cannot verify
              freshness, allergens or safe storage.
            </p>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" required /> I confirm the pickup details and
            food safety information are accurate.
          </label>
          <Button type="submit" disabled={busy} className="full-width">
            {busy ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}{" "}
            Publish donation
          </Button>
        </section>
      </form>
    </>
  );
}
function Impact() {
  const { data, user } = useStore();
  const [scope, setScope] = useState("Network");
  const ds =
    scope === "My impact" && user
      ? data.donations.filter((d) =>
          user.role === "restaurant"
            ? d.restaurant_id === user.id
            : user.role === "ngo"
              ? data.reservations.some(
                  (r) => r.ngo_id === user.id && r.donation_id === d.id,
                )
              : data.volunteer_tasks.some(
                  (t) => t.volunteer_id === user.id && t.donation_id === d.id,
                ),
        )
      : data.donations;
  const v = impact(ds);
  return (
    <>
      <Heading
        eyebrow="THE BIGGER PICTURE"
        title="Small rescues. Lasting change."
        description="The difference we make, one completed rescue at a time."
        action={
          user ? (
            <select
              aria-label="Impact scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option>Network</option>
              <option>My impact</option>
            </select>
          ) : (
            <Button asChild>
              <Link href="/login">Join the network</Link>
            </Button>
          )
        }
      />
      <section className="impact-hero">
        <span className="eyebrow">MEALS THAT FOUND THEIR WAY</span>
        <strong>{v.meals.toLocaleString()}</strong>
        <p>meal portions rescued through completed donations.</p>
        <Leaf size={90} />
      </section>
      <div className="three-grid impact-stats">
        <Stat
          label="Waste prevented"
          value={`${v.kg.toFixed(1)} kg`}
          note="Estimated at 0.4 kg per portion"
          icon={Package}
        />
        <Stat
          label="Estimated CO₂e avoided"
          value={`${v.co2.toFixed(1)} kg`}
          note="Illustrative factor: 2.5 kg CO₂e / kg food"
          icon={Globe}
        />
        <Stat
          label="Environmental score"
          value={`${v.score}/100`}
          note="1 point per 5 meals · capped at 100"
          icon={Sprout}
        />
      </div>
      <div className="bottom-grid">
        <section className="panel">
          <h2>Every rescue has a story.</h2>
          {ds.filter((d) => d.status === "completed").length ? (
            ds
              .filter((d) => d.status === "completed")
              .slice(0, 6)
              .map((d) => (
                <Link
                  className="activity-row"
                  href={"/donations/" + d.id}
                  key={d.id}
                >
                  <span className="activity-icon">
                    <Check size={18} />
                  </span>
                  <div>
                    <strong>{d.food_name}</strong>
                    <small>
                      {d.quantity} meals · {d.location}
                    </small>
                  </div>
                  <ArrowUpRight size={16} />
                </Link>
              ))
          ) : (
            <p className="muted">
              Your first completed rescue starts the story.
            </p>
          )}
        </section>
        <section className="panel">
          <span className="eyebrow">MEASURED WITH CARE</span>
          <h2>
            Real actions.
            <br />
            Transparent estimates.
          </h2>
          <p>
            Only completed donations count. Reserved and expired food is not
            counted as rescued.
          </p>
          <p>
            Meal quantities are entered by donors. Weight and emissions are
            estimates based on fixed MVP assumptions, not measured food weight
            or independently verified carbon savings.
          </p>
          <Link className="inline-link" href="/about">
            Learn about the model <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
function Leaderboard() {
  const { data } = useStore();
  const [role, setRole] = useState<Role>("restaurant");
  const ranked = data.users
    .filter((u) => u.role === role)
    .map((u) => ({
      ...u,
      total: data.points
        .filter((p) => p.user_id === u.id)
        .reduce((a, p) => a + p.amount, 0),
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  return (
    <>
      <Heading
        eyebrow="THE PEOPLE BEHIND THE PROGRESS"
        title="Good deserves recognition."
        description="Celebrating the kitchens and neighbours showing up for their community."
      />
      <div className="tabs">
        <button
          className={role === "restaurant" ? "active" : ""}
          onClick={() => setRole("restaurant")}
        >
          Top restaurants
        </button>
        <button
          className={role === "volunteer" ? "active" : ""}
          onClick={() => setRole("volunteer")}
        >
          Top volunteers
        </button>
      </div>
      <section className="panel leaderboard">
        <div className="leaderboard-head">
          <span>COMMUNITY PARTNER</span>
          <span>POINTS EARNED</span>
        </div>
        {ranked.length ? (
          ranked.map((u, i) => (
            <div className="rank-row" key={u.id}>
              <span className={i === 0 ? "rank-number first" : "rank-number"}>
                {i === 0 ? (
                  <Trophy size={22} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <span className="avatar">{u.name.slice(0, 1)}</span>
              <div className="rank-name">
                <strong>{u.name}</strong>
                <small>{u.location}</small>
              </div>
              <span className="rank-badge">{badge(role, u.total)}</span>
              <strong className="rank-points">
                {u.total}
                <small>points</small>
              </strong>
            </div>
          ))
        ) : (
          <div className="empty">
            <Trophy />
            <p>The first rescue sets the pace.</p>
          </div>
        )}
      </section>
      <section className="bottom-grid">
        <div className="panel">
          <h3>Restaurant recognition</h3>
          <p>
            Small donation (&lt;10 meals): 10 points.
            <br />
            Medium (10–29): 25 points.
            <br />
            Large (30+): 50 points.
          </p>
          <p className="fine-print">
            Awarded on completion only. Badges: Food Saver 10+, Community Hero
            150+, Platinum Donor 500+.
          </p>
        </div>
        <div className="panel">
          <h3>Volunteer recognition</h3>
          <p>
            Pickup: 10 points.
            <br />
            Delivery: 15 points.
            <br />
            Urgent delivery: 25 points instead of 15.
          </p>
          <p className="fine-print">
            Urgent means expiry within two hours at delivery. Badges: Helper
            10+, Rescuer 100+, Champion 300+.
          </p>
        </div>
      </section>
    </>
  );
}
function SettingsPage() {
  const { user, saveProfile, reset, setError } = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  if (!user) return null;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const f = new FormData(e.currentTarget);
    try {
      await saveProfile({
        name: String(f.get("name")),
        location: String(f.get("location")),
        lat: Number(f.get("lat")),
        lng: Number(f.get("lng")),
        capacity: Number(f.get("capacity")),
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your profile, your preferences."
        description="Keep your details up to date for better local connections."
      />
      <form className="panel settings-panel" onSubmit={submit}>
        <h2>Community profile</h2>
        <label>
          Name
          <input
            name="name"
            required
            defaultValue={user.name}
            maxLength={100}
          />
        </label>
        <label>
          Role
          <input value={roleNames[user.role]} disabled readOnly />
        </label>
        <label>
          Address / neighbourhood
          <input
            name="location"
            required
            defaultValue={user.location}
            maxLength={250}
          />
        </label>
        <div className="two-grid">
          <label>
            Latitude
            <input
              name="lat"
              type="number"
              min={-90}
              max={90}
              step="any"
              required
              defaultValue={user.lat}
            />
          </label>
          <label>
            Longitude
            <input
              name="lng"
              type="number"
              min={-180}
              max={180}
              step="any"
              required
              defaultValue={user.lng}
            />
          </label>
        </div>
        <label>
          Receiving capacity (meals per rescue)
          <input
            name="capacity"
            type="number"
            min={1}
            max={10000}
            required
            defaultValue={user.capacity}
          />
        </label>
        <p className="fine-print">
          NGO capacity and coordinates improve matching. Role cannot be changed
          after registration.
        </p>
        <Button disabled={busy}>
          {busy ? <Loader2 className="spin" size={16} /> : <Check size={16} />}{" "}
          Save changes
        </Button>
        {saved && (
          <p role="status" className="accent">
            Profile updated.
          </p>
        )}
      </form>
      {live ? (
        <form
          className="panel settings-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            const password = String(
              new FormData(e.currentTarget).get("password"),
            );
            const { error } = await supabase!.auth.updateUser({ password });
            setError(error ? error.message : "Password updated.");
          }}
        >
          <h2>Account security</h2>
          <label>
            New password
            <input
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <Button variant="outline">Update password</Button>
        </form>
      ) : (
        <div className="panel settings-panel">
          <h2>Presentation controls</h2>
          <p>
            Reset listings, points and example accounts on this device. This
            does not affect any other device.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm("Reset all presentation data on this device?")) {
                reset();
                router.push("/login");
              }
            }}
          >
            <RefreshCw size={17} /> Reset demo data
          </Button>
        </div>
      )}
    </>
  );
}
