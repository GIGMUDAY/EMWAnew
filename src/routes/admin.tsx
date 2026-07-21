import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  UploadCloud,
  UserRoundCheck,
  UsersRound,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import logo from "@/assets/emwa-logo-new.png";
import {
  adminApi,
  API_BASE,
  ApiError,
  listData,
  loginAdmin,
  logoutAdmin,
  type ApplicationStatus,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administration — EMWA" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

type Section =
  | "overview"
  | "updates"
  | "events"
  | "experts"
  | "memberships"
  | "membership-types"
  | "resources"
  | "messages"
  | "subscribers"
  | "administrators";
type AdminSession = {
  token: string;
  refreshToken: string;
  admin: { id: string; fullName: string; email?: string; role: string };
};
type Dashboard = Record<string, string | number> & {
  recentApplications?: Record<string, unknown>[];
  recentContactMessages?: Record<string, unknown>[];
};
type Expert = {
  id: string;
  full_name: string;
  email: string;
  professional_title: string;
  area_of_expertise: string;
  location: string;
  status: ApplicationStatus;
  created_at: string;
  biography?: string;
  profile_photo_url?: string;
};
type Membership = {
  id: string;
  full_name: string;
  email: string;
  outlet_or_institution: string;
  current_position: string;
  region_or_chapter: string;
  membership_type_id: string;
  status: ApplicationStatus;
  created_at: string;
};
type MembershipType = {
  id: string;
  name: string;
  description: string;
  requirements: string;
  price_amount: string;
  currency: string;
  is_active: boolean;
};
type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  mime_type: string;
  file_size: string;
  is_published: boolean;
  created_at: string;
};
type Contact = {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  created_at: string;
};
type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type UpdatePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_type: "NEWS" | "PRESS" | "ARTICLE" | "PHOTO" | "VIDEO";
  featured_image_url?: string;
  video_url?: string;
  author_name: string;
  status: PublishStatus;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
};
type AdminEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  location: string;
  starts_at: string;
  ends_at?: string;
  registration_url?: string;
  capacity_status: "AVAILABLE" | "AT_CAPACITY" | "CANCELLED";
  featured_image_url?: string;
  status: PublishStatus;
  created_at: string;
};
type Administrator = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};
type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
};

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "updates", label: "Updates", icon: Newspaper },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "experts", label: "Expert applications", icon: UserRoundCheck },
  { id: "memberships", label: "Membership requests", icon: UsersRound },
  { id: "membership-types", label: "Membership types", icon: BookOpen },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "messages", label: "Contact messages", icon: MessageSquare },
  { id: "subscribers", label: "Email subscribers", icon: Inbox },
  { id: "administrators", label: "Administrators", icon: ShieldCheck },
];

const fmtDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );

const uploadUrl = (value?: string) => {
  if (!value) return "";
  try {
    const path = new URL(value).pathname;
    return `${new URL(API_BASE).origin}${path}`;
  } catch {
    return value;
  }
};

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  const logAdminButtonClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;

    const label =
      button.getAttribute("aria-label") ||
      button.getAttribute("title") ||
      button.textContent?.replace(/\s+/g, " ").trim() ||
      "Unlabelled button";

    console.info("[EMWA Admin] Button clicked", {
      action: label,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleLogin = useCallback((next: AdminSession) => {
    window.localStorage.setItem("emwa_admin_session", JSON.stringify(next));
    setSession(next);
  }, []);

  const handleLogout = useCallback(() => {
    if (session?.refreshToken && session.token !== "frontend-demo-session") {
      void logoutAdmin(session.refreshToken).catch(() => undefined);
    }
    window.localStorage.removeItem("emwa_admin_session");
    setSession(null);
  }, [session]);

  useEffect(() => {
    const saved = window.localStorage.getItem("emwa_admin_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminSession;
        if (!parsed.token || parsed.token === "frontend-demo-session") {
          window.localStorage.removeItem("emwa_admin_session");
          return;
        }
        setSession(parsed);
      } catch {
        window.localStorage.removeItem("emwa_admin_session");
      }
    }
  }, []);

  useEffect(() => {
    const expireSession = () => setSession(null);
    window.addEventListener("emwa-admin-session-expired", expireSession);
    return () => window.removeEventListener("emwa-admin-session-expired", expireSession);
  }, []);

  useEffect(() => {
    const updateSession = (event: Event) => {
      setSession((event as CustomEvent<AdminSession>).detail);
    };
    window.addEventListener("emwa-admin-session-updated", updateSession);
    return () => window.removeEventListener("emwa-admin-session-updated", updateSession);
  }, []);

  return (
    <div onClickCapture={logAdminButtonClick}>
      {!session ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminWorkspace session={session} onLogout={handleLogout} />
      )}
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginAdmin(email, password);
      onLogin({
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        admin: response.data.admin,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#171513] text-[#f5f0e7] grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden lg:flex min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 p-12 xl:p-16">
        <div
          className="absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="relative">
          <img src={logo} alt="EMWA" className="h-16 w-auto brightness-0 invert" />
        </div>
        <div className="relative max-w-2xl">
          <p className="label-mono text-[#e4ab3a]">Private administration</p>
          <h1 className="mt-6 text-[clamp(4.6rem,8vw,8.5rem)] leading-[.82] tracking-[-.055em]">
            THE WORK
            <br />
            <span className="text-[#a53b4d]">BEHIND</span>
            <br />
            THE MISSION.
          </h1>
          <p className="mt-8 max-w-lg font-[var(--font-body)] text-lg leading-8 text-white/55">
            Review applications, protect quality, publish resources, and keep EMWA's growing
            community moving.
          </p>
        </div>
        <p className="relative label-mono text-white/30">
          Ethiopian Media Women Association · Secure workspace
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 py-16 text-[#1c1917]">
        <div className="w-full max-w-md">
          <img src={logo} alt="EMWA" className="mb-16 h-14 w-auto lg:hidden" />
          <p className="label-mono text-[#8c2d3c]">Administrator access</p>
          <h2 className="mt-4 text-5xl font-black tracking-[-.04em] sm:text-6xl">Welcome back.</h2>
          <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-black/55">
            Sign in with your EMWA administrator account to access the secure command desk.
          </p>
          <form onSubmit={submit} className="mt-12 space-y-7">
            <AdminInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@emwa.org.et"
              autoComplete="email"
              required
            />
            <AdminInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            {error && (
              <div className="border-l-4 border-[#8c2d3c] bg-[#8c2d3c]/8 px-4 py-3 font-[var(--font-body)] text-sm text-[#6f1f2c]">
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="group flex w-full items-center justify-between bg-[#1c1917] px-6 py-5 font-[var(--font-body)] text-sm font-bold text-white transition hover:bg-[#8c2d3c] disabled:opacity-60"
            >
              <span>{loading ? "Signing in…" : "Enter administration"}</span>
              {loading ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
          <a
            href="/"
            className="mt-10 inline-flex items-center gap-2 label-mono text-black/45 hover:text-[#8c2d3c]"
          >
            ← Return to public website
          </a>
        </div>
      </section>
    </main>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  ...props
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
>) {
  return (
    <label className="block">
      <span className="label-mono text-black/55">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full border-0 border-b border-black/25 bg-transparent px-0 py-4 font-[var(--font-body)] text-lg outline-none transition placeholder:text-black/25 focus:border-[#8c2d3c]"
      />
    </label>
  );
}

function AdminWorkspace({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [section, setSection] = useState<Section>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [types, setTypes] = useState<MembershipType[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [updates, setUpdates] = useState<UpdatePost[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    if (session.token === "frontend-demo-session") {
      const now = new Date().toISOString();
      setDashboard({ demo: "true" });
      setExperts([
        {
          id: "demo-expert-1",
          full_name: "Hana Bekele",
          email: "hana@example.com",
          professional_title: "Investigative Reporter",
          area_of_expertise: "Journalism",
          location: "Addis Ababa",
          status: "PENDING",
          created_at: now,
          biography: "Reporter covering public-interest and community stories.",
        },
      ]);
      setMemberships([
        {
          id: "demo-member-1",
          full_name: "Marta Tesfaye",
          email: "marta@example.com",
          outlet_or_institution: "Addis Media Network",
          current_position: "Producer",
          region_or_chapter: "Addis Ababa",
          membership_type_id: "demo-type-1",
          status: "PENDING",
          created_at: now,
        },
      ]);
      setTypes([
        {
          id: "demo-type-1",
          name: "Full Member",
          description: "Working women journalists, producers, and editors.",
          requirements: "Active media professional",
          price_amount: "800",
          currency: "ETB",
          is_active: true,
        },
      ]);
      setResources([
        {
          id: "demo-resource-1",
          title: "Safe Reporting Handbook",
          description: "A practical guide for women working in Ethiopian media.",
          category: "Guide",
          file_url: "#",
          mime_type: "application/pdf",
          file_size: "2400000",
          is_published: true,
          created_at: now,
        },
      ]);
      setContacts([
        {
          id: "demo-contact-1",
          full_name: "Selam Worku",
          email: "selam@example.com",
          subject: "Partnership",
          message: "We would like to discuss a regional media partnership.",
          status: "NEW",
          created_at: now,
        },
      ]);
      setUpdates([
        {
          id: "demo-update-1",
          title: "EMWA submits gender-equity brief to Parliament",
          slug: "emwa-submits-gender-equity-brief-to-parliament",
          excerpt: "A policy agenda for measurable representation and safer newsrooms.",
          content:
            "EMWA has submitted a new policy brief calling for measurable representation, safer working environments, and transparent leadership pathways across Ethiopia's public media institutions.",
          content_type: "NEWS",
          author_name: "EMWA Editorial Desk",
          status: "PUBLISHED",
          is_featured: true,
          published_at: now,
          created_at: now,
        },
      ]);
      setEvents([
        {
          id: "demo-event-1",
          title: "Regional Chapter Convening",
          slug: "regional-chapter-convening",
          description: "A gathering for regional members, editors, and program partners.",
          event_type: "Convening",
          location: "Hawassa University",
          starts_at: now,
          capacity_status: "AVAILABLE",
          status: "PUBLISHED",
          created_at: now,
        },
      ]);
      setLoading(false);
      return;
    }
    try {
      const [
        dash,
        expertList,
        memberList,
        typeList,
        resourceList,
        contactList,
        updateList,
        eventList,
        administratorList,
        subscriberList,
      ] = await Promise.all([
        adminApi<Dashboard>("/admin/dashboard", session.token),
        listData<Expert>("/admin/expert-applications?page=1&limit=100", session.token),
        listData<Membership>("/admin/membership-applications?page=1&limit=100", session.token),
        adminApi<MembershipType[]>("/public/membership-types", session.token),
        listData<Resource>("/admin/resources?page=1&limit=100", session.token),
        listData<Contact>("/admin/contact-messages?page=1&limit=100", session.token),
        listData<UpdatePost>("/admin/updates?page=1&limit=100", session.token),
        listData<AdminEvent>("/admin/events?page=1&limit=100&order=asc", session.token),
        listData<Administrator>("/admin/admins?page=1&limit=100", session.token),
        listData<NewsletterSubscriber>(
          "/admin/newsletter-subscribers?page=1&limit=100",
          session.token,
        ),
      ]);
      setDashboard(dash.data);
      setExperts(expertList.rows);
      setMemberships(memberList.rows);
      setTypes(typeList.data);
      setResources(resourceList.rows);
      setContacts(contactList.rows);
      setUpdates(updateList.rows);
      setEvents(eventList.rows);
      setAdministrators(administratorList.rows);
      setSubscribers(subscriberList.rows);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) return onLogout();
      setError(cause instanceof Error ? cause.message : "Unable to load administration data");
    } finally {
      setLoading(false);
    }
  }, [session.token, onLogout]);

  useEffect(() => {
    void load();
  }, [load]);
  const navigate = (next: Section) => {
    setSection(next);
    setMobileNav(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_85%_5%,rgba(140,45,60,.10),transparent_24%),#f4f0e8] text-[14px] text-[#1c1917] lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[264px] min-h-0 flex-col overflow-hidden bg-[linear-gradient(165deg,#211e1b_0%,#171513_60%,#2a171a_100%)] text-white shadow-2xl transition-transform lg:sticky lg:top-0 ${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-7">
          <img src={logo} alt="EMWA" className="h-11 w-auto brightness-0 invert" />
          <button onClick={() => setMobileNav(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <div className="shrink-0 px-7 pb-5 pt-6">
          <p className="label-mono text-white/35">Administration</p>
          <p className="mt-2 truncate font-[var(--font-body)] text-sm font-semibold">
            {session.admin.fullName}
          </p>
          <p className="mt-1 label-mono text-[#e4ab3a]">{session.admin.role}</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-[var(--font-body)] text-sm transition ${section === id ? "bg-[#9d3547] text-white shadow-lg shadow-black/20" : "text-white/60 hover:bg-white/8 hover:text-white"}`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {section === id && <ChevronRight className="ml-auto size-4" />}
            </button>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 bg-black/10 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 font-[var(--font-body)] text-sm text-white/65 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}
      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-black/10 bg-[#f4f0e8]/90 px-5 py-3 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(true)}
              className="grid size-10 place-items-center border border-black/15 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="label-mono !text-[8px] leading-none text-[#8c2d3c]">
                EMWA command desk
              </p>
              <p className="mt-2 font-[var(--font-display)] !text-[1.45rem] font-black leading-none tracking-[-.025em]">
                {navItems.find((item) => item.id === section)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 border border-black/15 px-4 py-2.5 label-mono hover:border-[#8c2d3c] hover:text-[#8c2d3c]"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>
        <div className="mx-auto w-full max-w-[1600px] p-5 md:p-7 xl:p-9">
          {error && (
            <div className="mb-7 flex items-center justify-between border-l-4 border-[#8c2d3c] bg-white p-5 font-[var(--font-body)] text-sm">
              <span>{error}</span>
              <button onClick={() => void load()} className="font-bold text-[#8c2d3c]">
                Retry
              </button>
            </div>
          )}
          {loading && !dashboard ? (
            <LoadingState />
          ) : (
            <>
              {section === "overview" && (
                <Overview
                  dashboard={dashboard}
                  experts={experts}
                  memberships={memberships}
                  resources={resources}
                  contacts={contacts}
                  navigate={navigate}
                />
              )}
              {section === "updates" && (
                <UpdatesPanel
                  rows={updates}
                  token={session.token}
                  reload={load}
                  setRows={setUpdates}
                />
              )}
              {section === "events" && (
                <EventsPanel
                  rows={events}
                  token={session.token}
                  reload={load}
                  setRows={setEvents}
                />
              )}
              {section === "experts" && (
                <ApplicationsPanel
                  title="Expert applications"
                  subtitle="Review professional profiles before they enter the public directory."
                  rows={experts}
                  type="expert"
                  token={session.token}
                  reload={load}
                />
              )}
              {section === "memberships" && (
                <MembershipPanel
                  rows={memberships}
                  types={types}
                  token={session.token}
                  reload={load}
                />
              )}
              {section === "membership-types" && (
                <MembershipTypesPanel rows={types} token={session.token} reload={load} />
              )}
              {section === "resources" && (
                <ResourcesPanel rows={resources} token={session.token} reload={load} />
              )}
              {section === "messages" && (
                <MessagesPanel rows={contacts} token={session.token} reload={load} />
              )}
              {section === "subscribers" && <SubscribersPanel rows={subscribers} />}
              {section === "administrators" && (
                <AdministratorsPanel
                  rows={administrators}
                  token={session.token}
                  currentAdmin={session.admin}
                  reload={load}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AdministratorsPanel({
  rows,
  token,
  currentAdmin,
  reload,
}: {
  rows: Administrator[];
  token: string;
  currentAdmin: AdminSession["admin"];
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN";

  const createAdministrator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    setCreated("");
    try {
      const fullName = String(values.get("fullName"));
      await adminApi<Administrator>("/admin/admins", token, {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email: String(values.get("email")),
          password: String(values.get("password")),
          role: String(values.get("role")),
        }),
      });
      form.reset();
      setCreated(`${fullName} can now sign in to the EMWA administration dashboard.`);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create administrator");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PagePanel
      title="Administrators"
      subtitle="View the people with access to the EMWA command desk and create secure accounts."
    >
      <div
        className={`grid gap-7 ${isSuperAdmin ? "xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]" : ""}`}
      >
        {isSuperAdmin && (
          <form
            onSubmit={createAdministrator}
            className="h-fit rounded-2xl bg-[#191715] p-6 text-white shadow-xl"
          >
            <p className="label-mono text-[#e4ab3a]">Super-admin control</p>
            <h3 className="mt-3 text-3xl font-black">Create an administrator</h3>
            <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-white/50">
              Create a named account with its own password and access level.
            </p>
            <div className="mt-7 grid gap-4">
              <PublicationInput
                name="fullName"
                label="Full name"
                minLength={2}
                maxLength={150}
                required
              />
              <PublicationInput
                name="email"
                label="Email address"
                type="email"
                maxLength={320}
                autoComplete="off"
                required
              />
              <PublicationInput
                name="password"
                label="Temporary password"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
              <p className="-mt-2 font-[var(--font-body)] text-xs leading-5 text-white/40">
                At least 12 characters with uppercase, lowercase, number, and symbol.
              </p>
              <PublicationSelect
                name="role"
                label="Access level"
                defaultValue="ADMIN"
                options={["ADMIN", "SUPER_ADMIN"]}
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
            {created && <p className="mt-4 text-sm text-emerald-300">{created}</p>}
            <button
              disabled={busy}
              className="mt-6 flex w-full items-center justify-between bg-[#8c2d3c] px-5 py-4 font-[var(--font-body)] text-sm font-bold hover:bg-[#a53b4d] disabled:opacity-50"
            >
              {busy ? "Creating accountâ€¦" : "Create administrator"}
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </button>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
          <PanelHeader
            eyebrow="Access directory"
            title={`${rows.length} administrator${rows.length === 1 ? "" : "s"}`}
          />
          {rows.length ? (
            <div className="divide-y divide-black/8">
              {rows.map((row) => (
                <article
                  key={row.id}
                  className="grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-[#eadfd3] font-black text-[#8c2d3c]">
                    {row.full_name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[var(--font-body)] text-sm font-bold">{row.full_name}</h3>
                      {row.id === currentAdmin.id && (
                        <span className="bg-[#e4ab3a]/20 px-2 py-1 label-mono text-[#7a5310]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-[var(--font-body)] text-sm text-black/50">
                      {row.email}
                    </p>
                    <p className="mt-2 label-mono text-black/35">Added {fmtDate(row.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="bg-[#ece5da] px-2.5 py-1 label-mono text-black/55">
                      {row.role}
                    </span>
                    <StatusBadge value={row.is_active ? "ACTIVE" : "INACTIVE"} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="No administrator accounts found" />
          )}
        </div>
      </div>
    </PagePanel>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-9 animate-spin text-[#8c2d3c]" />
        <p className="mt-4 label-mono text-black/45">Loading administration</p>
      </div>
    </div>
  );
}

function Overview({
  dashboard,
  experts,
  memberships,
  resources,
  contacts,
  navigate,
}: {
  dashboard: Dashboard | null;
  experts: Expert[];
  memberships: Membership[];
  resources: Resource[];
  contacts: Contact[];
  navigate: (section: Section) => void;
}) {
  const stats = [
    {
      label: "Pending experts",
      value: experts.filter((x) => x.status === "PENDING").length,
      icon: UserRoundCheck,
      section: "experts" as Section,
    },
    {
      label: "Pending members",
      value: memberships.filter((x) => x.status === "PENDING").length,
      icon: UsersRound,
      section: "memberships" as Section,
    },
    {
      label: "New messages",
      value: contacts.filter((x) => x.status === "NEW").length,
      icon: Inbox,
      section: "messages" as Section,
    },
    {
      label: "Published resources",
      value: resources.filter((x) => x.is_published).length,
      icon: FileText,
      section: "resources" as Section,
    },
  ];
  const recent = [
    ...experts.map((x) => ({
      id: x.id,
      name: x.full_name,
      kind: "Expert",
      status: x.status,
      date: x.created_at,
    })),
    ...memberships.map((x) => ({
      id: x.id,
      name: x.full_name,
      kind: "Membership",
      status: x.status,
      date: x.created_at,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[1.65rem] bg-[#1d1a18] px-7 py-8 text-white shadow-2xl shadow-black/10 md:px-9 md:py-9">
        <div className="absolute -right-12 -top-20 size-60 rounded-full border-[36px] border-[#9d3547]/70" />
        <div className="absolute bottom-0 right-1/3 h-24 w-px bg-white/10" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="label-mono text-[#e4ab3a]">Daily overview</p>
            <h2 className="mt-3 !text-[2.35rem] font-black leading-[.94] tracking-[-.04em] md:!text-[3rem]">
              Good work
              <br />
              starts here.
            </h2>
          </div>
          <p className="max-w-sm font-[var(--font-body)] text-sm leading-6 text-white/55">
            Everything requiring your attention, gathered in one clear workspace.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, section }) => (
          <button
            key={label}
            onClick={() => navigate(section)}
            className="group rounded-2xl border border-black/8 bg-[#fbf9f4] p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8c2d3c]/25 hover:bg-white hover:shadow-xl hover:shadow-black/8"
          >
            <div className="flex items-start justify-between">
              <Icon className="size-5 text-[#8c2d3c]" />
              <ArrowRight className="size-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
            <strong className="mt-10 block text-5xl font-black">{value}</strong>
            <span className="mt-2 block label-mono text-black/45">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
          <PanelHeader eyebrow="Incoming work" title="Recent applications" />
          <div>
            {recent.length ? (
              recent.map((item) => (
                <div
                  key={item.kind + item.id}
                  className="grid grid-cols-[1fr_auto] gap-4 border-t border-black/8 px-6 py-4 sm:grid-cols-[1fr_110px_110px]"
                >
                  <div>
                    <p className="font-[var(--font-body)] font-semibold">{item.name}</p>
                    <p className="mt-1 label-mono text-black/35">{fmtDate(item.date)}</p>
                  </div>
                  <span className="hidden self-center label-mono text-black/45 sm:block">
                    {item.kind}
                  </span>
                  <StatusBadge value={item.status} />
                </div>
              ))
            ) : (
              <EmptyState text="No applications yet" />
            )}
          </div>
        </section>
        <section className="rounded-2xl bg-[linear-gradient(145deg,#9d3547,#6e2230)] p-7 text-white shadow-xl shadow-[#8c2d3c]/15">
          <p className="label-mono text-white/55">At a glance</p>
          <h3 className="mt-4 text-3xl font-black">Community pulse</h3>
          <div className="mt-10 space-y-5 font-[var(--font-body)] text-sm">
            <Pulse label="Total expert requests" value={experts.length} />
            <Pulse label="Total member requests" value={memberships.length} />
            <Pulse label="Resource library" value={resources.length} />
            <Pulse label="Inbox" value={contacts.length} />
          </div>
          <p className="mt-10 border-t border-white/20 pt-5 text-sm leading-6 text-white/60">
            {dashboard
              ? "Live data from the EMWA administration API."
              : "Dashboard summary is syncing."}
          </p>
        </section>
      </div>
    </div>
  );
}

function Pulse({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/15 pb-3">
      <span className="text-white/65">{label}</span>
      <strong className="text-xl">{value}</strong>
    </div>
  );
}
function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 p-6">
      <div>
        <p className="label-mono text-[#8c2d3c]">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-black">{title}</h3>
      </div>
      {action}
    </header>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-48 place-items-center p-8 text-center">
      <div>
        <Archive className="mx-auto size-7 text-black/25" />
        <p className="mt-3 font-[var(--font-body)] text-sm text-black/45">{text}</p>
      </div>
    </div>
  );
}
function StatusBadge({ value }: { value: string }) {
  const style =
    value === "APPROVED" || value === "READ" || value === "ACTIVE"
      ? "bg-emerald-100 text-emerald-800"
      : value === "REJECTED" ||
          value === "ARCHIVED" ||
          value === "INACTIVE" ||
          value === "UNSUBSCRIBED"
        ? "bg-stone-200 text-stone-600"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`self-center justify-self-end px-2.5 py-1 label-mono ${style}`}>{value}</span>
  );
}

function ApplicationsPanel({
  title,
  subtitle,
  rows,
  type,
  token,
  reload,
}: {
  title: string;
  subtitle: string;
  rows: Expert[];
  type: "expert";
  token: string;
  reload: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const visible = rows.filter(
    (row) =>
      (filter === "ALL" || row.status === filter) &&
      `${row.full_name} ${row.email} ${row.area_of_expertise}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const review = async (id: string, status: "APPROVED" | "REJECTED") => {
    setBusy(id + status);
    try {
      await adminApi(`/admin/${type}-applications/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reviewNote:
            status === "APPROVED"
              ? "Approved from administration dashboard."
              : "Rejected after administrative review.",
        }),
      });
      await reload();
    } finally {
      setBusy("");
    }
  };
  return (
    <PagePanel title={title} subtitle={subtitle}>
      <FilterBar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
      {visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-black/10 bg-[#fbf9f4] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/8"
            >
              <div className="relative mb-6 grid aspect-[16/8] overflow-hidden rounded-xl bg-[linear-gradient(135deg,#e8ded1,#d7c5b3)]">
                <span className="m-auto text-5xl font-black text-[#8c2d3c]/45">
                  {row.full_name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                {row.profile_photo_url && (
                  <img
                    src={uploadUrl(row.profile_photo_url)}
                    alt={`${row.full_name}'s uploaded profile`}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover object-center transition duration-500 hover:scale-[1.03]"
                    onError={(event) => event.currentTarget.remove()}
                  />
                )}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-mono text-[#8c2d3c]">
                    {row.area_of_expertise || "Expert profile"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black">{row.full_name}</h3>
                  <p className="mt-1 font-[var(--font-body)] text-sm text-black/50">
                    {row.professional_title} · {row.location}
                  </p>
                </div>
                <StatusBadge value={row.status} />
              </div>
              <p className="mt-6 font-[var(--font-body)] text-sm leading-6 text-black/60">
                {row.biography || "No biography provided."}
              </p>
              <p className="mt-3 break-all font-[var(--font-body)] text-sm font-semibold text-[#8c2d3c]">
                {row.email}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                <span className="label-mono text-black/35">{fmtDate(row.created_at)}</span>
                {row.status === "PENDING" && (
                  <div className="flex gap-2">
                    <ActionButton
                      label="Reject"
                      busy={busy === row.id + "REJECTED"}
                      onClick={() => void review(row.id, "REJECTED")}
                      variant="outline"
                    />
                    <ActionButton
                      label="Approve"
                      busy={busy === row.id + "APPROVED"}
                      onClick={() => void review(row.id, "APPROVED")}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="No expert applications match this view" />
      )}
    </PagePanel>
  );
}

function MembershipPanel({
  rows,
  types,
  token,
  reload,
}: {
  rows: Membership[];
  types: MembershipType[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [typeId, setTypeId] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | ApplicationStatus>("ALL");
  const [busy, setBusy] = useState("");
  const visible = rows.filter(
    (row) =>
      (typeId === "ALL" || row.membership_type_id === typeId) &&
      (status === "ALL" || row.status === status),
  );
  const review = async (id: string, next: "APPROVED" | "REJECTED") => {
    setBusy(id + next);
    try {
      await adminApi(`/admin/membership-applications/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status: next,
          reviewNote: `${next === "APPROVED" ? "Approved" : "Rejected"} from administration dashboard.`,
        }),
      });
      await reload();
    } finally {
      setBusy("");
    }
  };
  return (
    <PagePanel
      title="Membership requests"
      subtitle="Review applications by membership category and status."
    >
      <div className="mb-6 grid gap-3 bg-[#e9e3d9] p-4 sm:grid-cols-2">
        <Select
          value={typeId}
          onChange={setTypeId}
          options={[
            { value: "ALL", label: "All membership types" },
            ...types.map((x) => ({ value: x.id, label: x.name })),
          ]}
        />
        <Select
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={["ALL", "PENDING", "APPROVED", "REJECTED"].map((x) => ({
            value: x,
            label: x === "ALL" ? "All statuses" : x,
          }))}
        />
      </div>
      {visible.length ? (
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-black/12 text-left">
                <Th>Name</Th>
                <Th>Professional home</Th>
                <Th>Membership</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-black/8 last:border-0">
                  <Td>
                    <strong>{row.full_name}</strong>
                    <small>{row.email}</small>
                  </Td>
                  <Td>
                    <strong>{row.current_position}</strong>
                    <small>
                      {row.outlet_or_institution} · {row.region_or_chapter}
                    </small>
                  </Td>
                  <Td>{types.find((x) => x.id === row.membership_type_id)?.name ?? "Unknown"}</Td>
                  <Td>
                    <StatusBadge value={row.status} />
                  </Td>
                  <Td>{fmtDate(row.created_at)}</Td>
                  <Td>
                    {row.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <ActionButton
                          label="Reject"
                          busy={busy === row.id + "REJECTED"}
                          onClick={() => void review(row.id, "REJECTED")}
                          variant="outline"
                        />
                        <ActionButton
                          label="Approve"
                          busy={busy === row.id + "APPROVED"}
                          onClick={() => void review(row.id, "APPROVED")}
                        />
                      </div>
                    ) : (
                      <span className="label-mono text-black/30">Reviewed</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="No membership requests match this view" />
      )}
    </PagePanel>
  );
}

function MembershipTypesPanel({
  rows,
  token,
  reload,
}: {
  rows: MembershipType[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", description: "", requirements: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminApi("/admin/membership-types", token, {
        method: "POST",
        body: JSON.stringify({ ...form, isActive: true }),
      });
      setForm({ name: "", description: "", requirements: "" });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create membership type");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PagePanel
      title="Membership types"
      subtitle="Define the membership paths applicants can choose."
    >
      <div className="grid gap-8 xl:grid-cols-[.8fr_1.2fr]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl bg-[linear-gradient(145deg,#211e1b,#171513)] p-7 text-white shadow-xl"
        >
          <p className="label-mono text-[#e4ab3a]">Add a category</p>
          <h3 className="mt-3 text-3xl font-black">New membership type</h3>
          <div className="mt-8 space-y-5">
            <DarkInput
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <DarkInput
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
            <DarkInput
              label="Requirements"
              value={form.requirements}
              onChange={(v) => setForm({ ...form, requirements: v })}
            />
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <button
            disabled={busy}
            className="mt-7 flex w-full items-center justify-between bg-[#8c2d3c] px-5 py-4 font-[var(--font-body)] text-sm font-bold hover:bg-[#a53b4d]"
          >
            {busy ? "Creating…" : "Create membership type"}
            <ArrowRight className="size-4" />
          </button>
        </form>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <article
              key={row.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="label-mono text-[#8c2d3c]">0{index + 1}</span>
              <div>
                <h3 className="text-xl font-black">{row.name}</h3>
                <p className="mt-2 font-[var(--font-body)] text-sm text-black/55">
                  {row.description}
                </p>
                <p className="mt-3 label-mono text-black/35">{row.requirements}</p>
              </div>
              <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                <strong className="font-[var(--font-body)]">
                  {Number(row.price_amount) === 0
                    ? "Free"
                    : `${row.currency} ${Number(row.price_amount).toLocaleString()}`}
                </strong>
                <p className="mt-2 label-mono text-emerald-700">
                  {row.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PagePanel>
  );
}

function UpdatesPanel({
  rows,
  token,
  reload,
  setRows,
}: {
  rows: UpdatePost[];
  token: string;
  reload: () => Promise<void>;
  setRows: React.Dispatch<React.SetStateAction<UpdatePost[]>>;
}) {
  const [editing, setEditing] = useState<UpdatePost | null>(null);
  const [preview, setPreview] = useState<UpdatePost | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const demo = token === "frontend-demo-session";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("isFeatured", data.has("isFeatured") ? "true" : "false");
    try {
      if (demo) {
        const now = new Date().toISOString();
        const next: UpdatePost = {
          id: editing?.id ?? crypto.randomUUID(),
          title: String(data.get("title")),
          slug: String(data.get("slug") || data.get("title"))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          excerpt: String(data.get("excerpt")),
          content: String(data.get("content")),
          content_type: String(data.get("contentType")) as UpdatePost["content_type"],
          video_url: String(data.get("videoUrl") || "") || undefined,
          author_name: String(data.get("authorName")),
          status: String(data.get("status")) as PublishStatus,
          is_featured: data.get("isFeatured") === "true",
          published_at: data.get("status") === "PUBLISHED" ? now : undefined,
          created_at: editing?.created_at ?? now,
        };
        setRows((current) =>
          [next, ...current.filter((row) => row.id !== next.id)].map((row) =>
            next.is_featured && next.status === "PUBLISHED" && row.id !== next.id
              ? { ...row, is_featured: false }
              : row,
          ),
        );
      } else {
        await adminApi(editing ? `/admin/updates/${editing.id}` : "/admin/updates", token, {
          method: editing ? "PATCH" : "POST",
          body: data,
        });
        await reload();
      }
      form.reset();
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save update");
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (row: UpdatePost, status: PublishStatus) => {
    if (demo) {
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status,
                published_at: status === "PUBLISHED" ? new Date().toISOString() : undefined,
              }
            : item,
        ),
      );
      return;
    }
    const data = new FormData();
    data.set("status", status);
    await adminApi(`/admin/updates/${row.id}`, token, { method: "PATCH", body: data });
    await reload();
  };

  const remove = async (row: UpdatePost) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    if (demo) setRows((current) => current.filter((item) => item.id !== row.id));
    else {
      await adminApi(`/admin/updates/${row.id}`, token, { method: "DELETE" });
      await reload();
    }
  };

  return (
    <PagePanel
      title="Updates"
      subtitle="Write, preview, and publish newsroom content for the public Updates page."
    >
      <div className="grid gap-7 xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]">
        <form
          key={editing?.id ?? "new"}
          onSubmit={submit}
          className="h-fit rounded-2xl bg-[#191715] p-6 text-white shadow-xl"
        >
          <p className="label-mono text-[#e4ab3a]">{editing ? "Edit story" : "New story"}</p>
          <h3 className="mt-3 text-3xl font-black">
            {editing ? editing.title : "Publish an update"}
          </h3>
          <div className="mt-7 grid gap-4">
            <PublicationInput
              name="title"
              label="Title"
              defaultValue={editing?.title}
              minLength={3}
              maxLength={220}
              required
            />
            <PublicationInput
              name="slug"
              label="Custom slug (optional)"
              defaultValue={editing?.slug}
              minLength={3}
              maxLength={240}
            />
            <PublicationTextarea
              name="excerpt"
              label="Short excerpt"
              defaultValue={editing?.excerpt}
              rows={3}
              minLength={10}
              maxLength={1000}
              required
            />
            <PublicationTextarea
              name="content"
              label="Full article"
              defaultValue={editing?.content}
              rows={8}
              minLength={30}
              maxLength={100000}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicationSelect
                name="contentType"
                label="Content type"
                defaultValue={editing?.content_type ?? "NEWS"}
                options={["NEWS", "PRESS", "ARTICLE", "PHOTO", "VIDEO"]}
              />
              <PublicationSelect
                name="status"
                label="Status"
                defaultValue={editing?.status ?? "DRAFT"}
                options={["DRAFT", "PUBLISHED", "ARCHIVED"]}
              />
              <PublicationInput
                name="authorName"
                label="Author"
                defaultValue={editing?.author_name ?? "EMWA Editorial Desk"}
                minLength={2}
                maxLength={150}
                required
              />
              <PublicationInput
                name="videoUrl"
                label="Video URL (optional)"
                defaultValue={editing?.video_url}
                type="url"
              />
            </div>
            <label className="flex items-center gap-3 font-[var(--font-body)] text-sm text-white/75">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={editing?.is_featured}
                className="accent-[#e4ab3a]"
              />{" "}
              Lead story
            </label>
            <label className="block">
              <span className="label-mono text-white/45">Featured image</span>
              <input
                name="featuredImage"
                type="file"
                accept="image/jpeg,image/png"
                className="mt-2 w-full text-sm file:mr-3 file:border-0 file:bg-[#8c2d3c] file:px-3 file:py-2 file:text-white"
              />
            </label>
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <div className="mt-6 flex gap-2">
            <button
              disabled={busy}
              className="flex-1 bg-[#8c2d3c] px-4 py-3 font-bold hover:bg-[#a53b4d] disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create story"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-white/20 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="space-y-3">
          {rows.length ? (
            rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="label-mono text-[#8c2d3c]">
                      {row.content_type}
                      {row.is_featured ? " · Lead story" : ""}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{row.title}</h3>
                    <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-black/55">
                      {row.excerpt}
                    </p>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-black/10 pt-4">
                  <ActionButton label="Preview" onClick={() => setPreview(row)} variant="outline" />
                  <ActionButton label="Edit" onClick={() => setEditing(row)} variant="outline" />
                  {row.status !== "PUBLISHED" && (
                    <ActionButton
                      label="Publish"
                      onClick={() => void changeStatus(row, "PUBLISHED")}
                    />
                  )}
                  {row.status === "PUBLISHED" && (
                    <ActionButton
                      label="Archive"
                      onClick={() => void changeStatus(row, "ARCHIVED")}
                      variant="outline"
                    />
                  )}
                  <button
                    onClick={() => void remove(row)}
                    aria-label={`Delete ${row.title}`}
                    className="ml-auto grid size-9 place-items-center border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState text="No updates have been created" />
          )}
        </div>
      </div>
      {preview && (
        <ContentPreview
          title={preview.title}
          image={preview.featured_image_url}
          eyebrow={preview.content_type}
          body={preview.content}
          onClose={() => setPreview(null)}
        />
      )}
    </PagePanel>
  );
}

function EventsPanel({
  rows,
  token,
  reload,
  setRows,
}: {
  rows: AdminEvent[];
  token: string;
  reload: () => Promise<void>;
  setRows: React.Dispatch<React.SetStateAction<AdminEvent[]>>;
}) {
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const demo = token === "frontend-demo-session";
  const localDate = (value?: string) => (value ? new Date(value).toISOString().slice(0, 16) : "");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      if (demo) {
        const now = new Date().toISOString();
        const next: AdminEvent = {
          id: editing?.id ?? crypto.randomUUID(),
          title: String(data.get("title")),
          slug: String(data.get("slug") || data.get("title"))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          description: String(data.get("description")),
          event_type: String(data.get("eventType")),
          location: String(data.get("location")),
          starts_at: new Date(String(data.get("startsAt"))).toISOString(),
          ends_at: data.get("endsAt")
            ? new Date(String(data.get("endsAt"))).toISOString()
            : undefined,
          registration_url: String(data.get("registrationUrl") || "") || undefined,
          capacity_status: String(data.get("capacityStatus")) as AdminEvent["capacity_status"],
          status: String(data.get("status")) as PublishStatus,
          created_at: editing?.created_at ?? now,
        };
        setRows((current) => [next, ...current.filter((row) => row.id !== next.id)]);
      } else {
        await adminApi(editing ? `/admin/events/${editing.id}` : "/admin/events", token, {
          method: editing ? "PATCH" : "POST",
          body: data,
        });
        await reload();
      }
      form.reset();
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save event");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: AdminEvent) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    if (demo) setRows((current) => current.filter((item) => item.id !== row.id));
    else {
      await adminApi(`/admin/events/${row.id}`, token, { method: "DELETE" });
      await reload();
    }
  };
  const changeStatus = async (row: AdminEvent, status: PublishStatus) => {
    if (demo) {
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, status } : item)),
      );
      return;
    }
    const data = new FormData();
    data.set("status", status);
    await adminApi(`/admin/events/${row.id}`, token, { method: "PATCH", body: data });
    await reload();
  };

  return (
    <PagePanel
      title="Events"
      subtitle="Create gatherings, registration opportunities, and public calendar entries."
    >
      <div className="grid gap-7 xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]">
        <form
          key={editing?.id ?? "new-event"}
          onSubmit={submit}
          className="h-fit rounded-2xl bg-[#191715] p-6 text-white shadow-xl"
        >
          <p className="label-mono text-[#e4ab3a]">{editing ? "Edit event" : "New event"}</p>
          <h3 className="mt-3 text-3xl font-black">
            {editing ? editing.title : "Add to the calendar"}
          </h3>
          <div className="mt-7 grid gap-4">
            <PublicationInput name="title" label="Title" defaultValue={editing?.title} required />
            <PublicationInput
              name="slug"
              label="Custom slug (optional)"
              defaultValue={editing?.slug}
            />
            <PublicationTextarea
              name="description"
              label="Description"
              defaultValue={editing?.description}
              rows={5}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicationInput
                name="eventType"
                label="Event type"
                defaultValue={editing?.event_type}
                required
              />
              <PublicationInput
                name="location"
                label="Location"
                defaultValue={editing?.location}
                required
              />
              <PublicationInput
                name="startsAt"
                label="Starts"
                type="datetime-local"
                defaultValue={localDate(editing?.starts_at)}
                required
              />
              <PublicationInput
                name="endsAt"
                label="Ends (optional)"
                type="datetime-local"
                defaultValue={localDate(editing?.ends_at)}
              />
              <PublicationSelect
                name="capacityStatus"
                label="Capacity"
                defaultValue={editing?.capacity_status ?? "AVAILABLE"}
                options={["AVAILABLE", "AT_CAPACITY", "CANCELLED"]}
              />
              <PublicationSelect
                name="status"
                label="Status"
                defaultValue={editing?.status ?? "DRAFT"}
                options={["DRAFT", "PUBLISHED", "ARCHIVED"]}
              />
            </div>
            <PublicationInput
              name="registrationUrl"
              label="Registration URL (optional)"
              type="url"
              defaultValue={editing?.registration_url}
            />
            <label>
              <span className="label-mono text-white/45">Featured image</span>
              <input
                name="featuredImage"
                type="file"
                accept="image/jpeg,image/png"
                className="mt-2 w-full text-sm file:mr-3 file:border-0 file:bg-[#8c2d3c] file:px-3 file:py-2 file:text-white"
              />
            </label>
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <div className="mt-6 flex gap-2">
            <button
              disabled={busy}
              className="flex-1 bg-[#8c2d3c] px-4 py-3 font-bold disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create event"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-white/20 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="space-y-3">
          {rows.length ? (
            rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="label-mono text-[#8c2d3c]">{row.event_type}</p>
                    <h3 className="mt-2 text-2xl font-black">{row.title}</h3>
                    <p className="mt-2 font-[var(--font-body)] text-sm text-black/55">
                      {fmtDate(row.starts_at)} · {row.location}
                    </p>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
                <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-black/55">
                  {row.description}
                </p>
                <div className="mt-5 flex gap-2 border-t border-black/10 pt-4">
                  <ActionButton label="Edit" onClick={() => setEditing(row)} variant="outline" />
                  {row.status !== "PUBLISHED" && (
                    <ActionButton
                      label="Publish"
                      onClick={() => void changeStatus(row, "PUBLISHED")}
                    />
                  )}
                  {row.status === "PUBLISHED" && (
                    <ActionButton
                      label="Archive"
                      onClick={() => void changeStatus(row, "ARCHIVED")}
                      variant="outline"
                    />
                  )}
                  <button
                    onClick={() => void remove(row)}
                    className="ml-auto grid size-9 place-items-center border border-red-200 text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState text="No events have been created" />
          )}
        </div>
      </div>
    </PagePanel>
  );
}

function PublicationInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border border-white/15 bg-white/5 px-3 py-2.5 font-[var(--font-body)] text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function PublicationTextarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <textarea
        {...props}
        className="mt-2 w-full resize-y border border-white/15 bg-white/5 px-3 py-2.5 font-[var(--font-body)] text-sm leading-6 text-white outline-none focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function PublicationSelect({
  label,
  options,
  ...props
}: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <select
        {...props}
        className="mt-2 w-full border border-white/15 bg-[#211f1d] px-3 py-2.5 font-[var(--font-body)] text-sm text-white outline-none focus:border-[#e4ab3a]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function ContentPreview({
  title,
  eyebrow,
  body,
  image,
  onClose,
}: {
  title: string;
  eyebrow: string;
  body: string;
  image?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur"
      onMouseDown={onClose}
    >
      <article
        className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#fbf9f4] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {image && <img src={image} alt="" className="h-64 w-full object-cover" />}
        <div className="p-7 md:p-10">
          <div className="flex justify-between gap-4">
            <p className="label-mono text-[#8c2d3c]">{eyebrow} · Preview</p>
            <button onClick={onClose}>
              <X />
            </button>
          </div>
          <h2 className="mt-5 text-4xl font-black md:text-6xl">{title}</h2>
          <div className="mt-7 whitespace-pre-wrap font-[var(--font-body)] leading-8 text-black/65">
            {body}
          </div>
        </div>
      </article>
    </div>
  );
}

function ResourcesPanel({
  rows,
  token,
  reload,
}: {
  rows: Resource[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData(form);
      const file = data.get("file");
      if (!(file instanceof File) || !file.size) throw new Error("Please choose a resource file.");
      await adminApi("/admin/resources", token, { method: "POST", body: data });
      form.reset();
      setSuccess(
        "Resource uploaded successfully. Publish it when it is ready for the public library.",
      );
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const publish = async (row: Resource) => {
    setError("");
    setSuccess("");
    try {
      await adminApi(`/admin/resources/${row.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !row.is_published }),
      });
      setSuccess(
        row.is_published
          ? "Resource removed from the public library."
          : "Resource published successfully.",
      );
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the resource");
    }
  };
  return (
    <PagePanel
      title="Resource library"
      subtitle="Upload publications and control what appears on the public website."
    >
      <form
        onSubmit={upload}
        className="mb-8 grid gap-4 rounded-2xl border border-dashed border-[#8c2d3c]/50 bg-[#8c2d3c]/5 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <LightInput name="title" label="Title" placeholder="Community guide" />
        <LightInput name="category" label="Category" placeholder="Guides" />
        <LightInput name="description" label="Description" placeholder="Short description" />
        <label className="md:col-span-2 xl:col-span-3">
          <span className="label-mono text-black/50">File</span>
          <input
            name="file"
            required
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="mt-2 block w-full font-[var(--font-body)] text-sm file:mr-4 file:border-0 file:bg-[#191715] file:px-4 file:py-3 file:text-white"
          />
        </label>
        <button
          disabled={uploading}
          className="self-end bg-[#8c2d3c] px-6 py-3.5 font-[var(--font-body)] text-sm font-bold text-white hover:bg-[#6f1f2c]"
        >
          <UploadCloud className="mr-2 inline size-4" />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {error && <p className="md:col-span-full text-sm text-[#8c2d3c]">{error}</p>}
        {success && <p className="md:col-span-full text-sm text-emerald-700">{success}</p>}
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className="border border-black/12 bg-[#fbf9f4] p-5">
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center bg-[#191715] text-white">
                <FileText className="size-5" />
              </div>
              <StatusBadge value={row.is_published ? "APPROVED" : "PENDING"} />
            </div>
            <p className="mt-6 label-mono text-[#8c2d3c]">{row.category}</p>
            <h3 className="mt-2 text-xl font-black">{row.title}</h3>
            <p className="mt-2 line-clamp-2 font-[var(--font-body)] text-sm text-black/50">
              {row.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
              <a
                href={uploadUrl(row.file_url)}
                target="_blank"
                rel="noreferrer"
                className="label-mono text-black/45 hover:text-[#8c2d3c]"
              >
                Open file
              </a>
              <button
                onClick={() => void publish(row)}
                className={`px-3 py-2 label-mono ${row.is_published ? "border border-black/20" : "bg-[#8c2d3c] text-white"}`}
              >
                {row.is_published ? "Unpublish" : "Publish"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PagePanel>
  );
}

function MessagesPanel({
  rows,
  token,
  reload,
}: {
  rows: Contact[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<Contact | null>(rows[0] ?? null);
  useEffect(() => {
    if (selected && !rows.some((x) => x.id === selected.id)) setSelected(rows[0] ?? null);
  }, [rows, selected]);
  const update = async (id: string, status: Contact["status"]) => {
    await adminApi(`/admin/contact-messages/${id}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await reload();
    setSelected((current) => (current ? { ...current, status } : current));
  };
  return (
    <PagePanel
      title="Contact messages"
      subtitle="Read, organize, and archive messages from the public contact form."
    >
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm lg:grid-cols-[.85fr_1.15fr]">
        <div className="border-b border-black/10 lg:border-b-0 lg:border-r">
          {rows.length ? (
            rows.map((row) => (
              <button
                key={row.id}
                onClick={() => setSelected(row)}
                className={`block w-full border-b border-black/8 p-5 text-left transition ${selected?.id === row.id ? "bg-[#8c2d3c] text-white" : "hover:bg-black/[.025]"}`}
              >
                <div className="flex justify-between gap-4">
                  <strong className="font-[var(--font-body)] text-sm">{row.full_name}</strong>
                  <span
                    className={`label-mono ${selected?.id === row.id ? "text-white/55" : "text-black/35"}`}
                  >
                    {fmtDate(row.created_at)}
                  </span>
                </div>
                <p
                  className={`mt-2 truncate font-[var(--font-body)] text-sm ${selected?.id === row.id ? "text-white/65" : "text-black/50"}`}
                >
                  {row.subject}
                </p>
              </button>
            ))
          ) : (
            <EmptyState text="No contact messages" />
          )}
        </div>
        {selected ? (
          <article className="p-6 md:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-mono text-[#8c2d3c]">{selected.subject}</p>
                <h3 className="mt-3 text-3xl font-black">{selected.full_name}</h3>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-2 block font-[var(--font-body)] text-sm text-black/45"
                >
                  {selected.email}
                </a>
                {selected.company_name && (
                  <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-black/60">
                    {selected.company_name}
                  </p>
                )}
              </div>
              <StatusBadge value={selected.status} />
            </div>
            <p className="mt-10 max-w-2xl whitespace-pre-wrap font-[var(--font-body)] leading-7 text-black/70">
              {selected.message}
            </p>
            <div className="mt-10 flex flex-wrap gap-2 border-t border-black/10 pt-6">
              <ActionButton label="Mark read" onClick={() => void update(selected.id, "READ")} />
              <ActionButton
                label="Archive"
                onClick={() => void update(selected.id, "ARCHIVED")}
                variant="outline"
              />
            </div>
          </article>
        ) : (
          <EmptyState text="Select a message to read it" />
        )}
      </div>
    </PagePanel>
  );
}

function SubscribersPanel({ rows }: { rows: NewsletterSubscriber[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | NewsletterSubscriber["status"]>("ALL");
  const visible = rows.filter(
    (row) =>
      (status === "ALL" || row.status === status) &&
      row.email.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const downloadCsv = () => {
    const csv = [
      ["Email", "Status", "Subscribed at", "Unsubscribed at"],
      ...visible.map((row) => [
        row.email,
        row.status,
        row.subscribed_at,
        row.unsubscribed_at ?? "",
      ]),
    ]
      .map((cells) => cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "emwa-newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PagePanel
      title="Email subscribers"
      subtitle="View the audience subscribed to The Narrative Shift newsletter directly from PostgreSQL."
    >
      <div className="mb-6 grid gap-3 rounded-2xl bg-[#e9e3d9] p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="flex items-center gap-3 rounded-xl bg-[#fbf9f4] px-4">
          <Search className="size-4 text-black/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subscriber email"
            className="w-full bg-transparent py-3 font-[var(--font-body)] text-sm outline-none"
          />
        </label>
        <Select
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "UNSUBSCRIBED", label: "Unsubscribed" },
          ]}
        />
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!visible.length}
          className="border border-black/15 bg-[#fbf9f4] px-5 py-3 label-mono hover:border-[#8c2d3c] hover:text-[#8c2d3c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SubscriberMetric label="All subscribers" value={rows.length} icon={Inbox} />
        <SubscriberMetric
          label="Active"
          value={rows.filter((row) => row.status === "ACTIVE").length}
          icon={Check}
        />
        <SubscriberMetric
          label="Unsubscribed"
          value={rows.filter((row) => row.status === "UNSUBSCRIBED").length}
          icon={Archive}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
        {visible.length ? (
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-black/12 text-left">
                <Th>Email address</Th>
                <Th>Status</Th>
                <Th>Subscribed</Th>
                <Th>Last updated</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-black/8 last:border-0">
                  <Td>
                    <a href={`mailto:${row.email}`} className="font-semibold hover:text-[#8c2d3c]">
                      {row.email}
                    </a>
                  </Td>
                  <Td>
                    <StatusBadge value={row.status} />
                  </Td>
                  <Td>{fmtDate(row.subscribed_at)}</Td>
                  <Td>{fmtDate(row.updated_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            text={rows.length ? "No subscribers match these filters" : "No email subscribers yet"}
          />
        )}
      </div>
    </PagePanel>
  );
}

function SubscriberMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Inbox;
}) {
  return (
    <article className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm">
      <div>
        <p className="label-mono text-black/40">{label}</p>
        <strong className="mt-2 block text-3xl font-black">{value}</strong>
      </div>
      <span className="grid size-11 place-items-center rounded-full bg-[#8c2d3c]/10 text-[#8c2d3c]">
        <Icon className="size-5" />
      </span>
    </article>
  );
}

function PagePanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <header className="relative mb-7 overflow-hidden rounded-[1.65rem] bg-[#1d1a18] px-7 py-8 text-white shadow-2xl shadow-black/10 md:px-9 md:py-9">
        <div className="pointer-events-none absolute -right-12 -top-20 size-60 rounded-full border-[36px] border-[#9d3547]/70" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-px bg-white/10" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="label-mono text-[#e4ab3a]">Administration workflow</p>
            <h2 className="mt-4 max-w-3xl !text-[2rem] font-black leading-none tracking-[-.035em] md:!text-[2.65rem]">
              {title}
            </h2>
          </div>
          <p className="max-w-md font-[var(--font-body)] text-sm leading-6 text-white/55">
            {subtitle}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
function FilterBar({
  query,
  setQuery,
  filter,
  setFilter,
}: {
  query: string;
  setQuery: (v: string) => void;
  filter: string;
  setFilter: (v: "ALL" | ApplicationStatus) => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-[#e9e3d9] p-4 sm:flex-row">
      <label className="flex flex-1 items-center gap-3 rounded-xl bg-[#fbf9f4] px-4">
        <Search className="size-4 text-black/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications"
          className="w-full bg-transparent py-3 font-[var(--font-body)] text-sm outline-none"
        />
      </label>
      <Select
        value={filter}
        onChange={(v) => setFilter(v as "ALL" | ApplicationStatus)}
        options={["ALL", "PENDING", "APPROVED", "REJECTED"].map((x) => ({
          value: x,
          label: x === "ALL" ? "All statuses" : x,
        }))}
      />
    </div>
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 rounded-xl border-0 bg-[#fbf9f4] px-4 py-3 font-[var(--font-body)] text-sm outline-none sm:min-w-52"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
function ActionButton({
  label,
  onClick,
  busy = false,
  variant = "solid",
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  variant?: "solid" | "outline";
}) {
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`px-3 py-2 label-mono disabled:opacity-50 ${variant === "solid" ? "bg-[#8c2d3c] text-white hover:bg-[#6f1f2c]" : "border border-black/20 hover:border-[#8c2d3c] hover:text-[#8c2d3c]"}`}
    >
      {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : label}
    </button>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 label-mono text-black/40">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-5 py-4 font-[var(--font-body)] text-sm text-black/65">
      {typeof children === "object" ? children : <span>{children}</span>}
    </td>
  );
}
function DarkInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="label-mono text-white/40">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-white/20 bg-transparent py-3 font-[var(--font-body)] text-sm outline-none focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function LightInput({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label>
      <span className="label-mono text-black/50">{label}</span>
      <input
        name={name}
        required
        placeholder={placeholder}
        className="mt-2 w-full border border-black/15 bg-[#fbf9f4] px-4 py-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
      />
    </label>
  );
}
