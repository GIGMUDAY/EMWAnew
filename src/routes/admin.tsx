import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  BookOpen,
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
  RefreshCw,
  Search,
  ShieldCheck,
  UploadCloud,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import logo from "@/assets/emwa-logo-new.png";
import { adminApi, ApiError, listData, type ApplicationStatus } from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administration — EMWA" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

type Section =
  "overview" | "experts" | "memberships" | "membership-types" | "resources" | "messages";
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
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  created_at: string;
};

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "experts", label: "Expert applications", icon: UserRoundCheck },
  { id: "memberships", label: "Membership requests", icon: UsersRound },
  { id: "membership-types", label: "Membership types", icon: BookOpen },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "messages", label: "Contact messages", icon: MessageSquare },
];

const fmtDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  const handleLogin = useCallback((next: AdminSession) => {
    window.localStorage.setItem("emwa_admin_session", JSON.stringify(next));
    setSession(next);
  }, []);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem("emwa_admin_session");
    setSession(null);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("emwa_admin_session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("emwa_admin_session");
      }
    }
  }, []);

  if (!session) return <AdminLogin onLogin={handleLogin} />;
  return <AdminWorkspace session={session} onLogout={handleLogout} />;
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
    onLogin({
      token: "frontend-demo-session",
      refreshToken: "frontend-demo-refresh",
      admin: {
        id: "demo-super-admin",
        fullName: "Demo Super Admin",
        email: email || "superadmin@emwa.org",
        role: "SUPER_ADMIN",
      },
    });
    setLoading(false);
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
            This is a frontend demo. Enter any details or leave the fields empty, then continue to
            preview the administration dashboard.
          </p>
          <form onSubmit={submit} className="mt-12 space-y-7">
            <AdminInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Optional in demo mode"
              autoComplete="email"
            />
            <AdminInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Optional in demo mode"
              autoComplete="current-password"
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
      setLoading(false);
      return;
    }
    try {
      const [dash, expertList, memberList, typeList, resourceList, contactList] = await Promise.all(
        [
          adminApi<Dashboard>("/admin/dashboard", session.token),
          listData<Expert>("/admin/expert-applications?page=1&limit=100", session.token),
          listData<Membership>("/admin/membership-applications?page=1&limit=100", session.token),
          adminApi<MembershipType[]>("/public/membership-types", session.token),
          listData<Resource>("/admin/resources?page=1&limit=100", session.token),
          listData<Contact>("/admin/contact-messages?page=1&limit=100", session.token),
        ],
      );
      setDashboard(dash.data);
      setExperts(expertList.rows);
      setMemberships(memberList.rows);
      setTypes(typeList.data);
      setResources(resourceList.rows);
      setContacts(contactList.rows);
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
            </>
          )}
        </div>
      </main>
    </div>
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
    value === "APPROVED" || value === "READ"
      ? "bg-emerald-100 text-emerald-800"
      : value === "REJECTED" || value === "ARCHIVED"
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
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);
    setError("");
    try {
      const data = new FormData(event.currentTarget);
      await adminApi("/admin/resources", token, { method: "POST", body: data });
      event.currentTarget.reset();
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const publish = async (row: Resource) => {
    await adminApi(`/admin/resources/${row.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !row.is_published }),
    });
    await reload();
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
                href={row.file_url}
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
