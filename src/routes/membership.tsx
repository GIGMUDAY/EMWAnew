import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import logo from "@/assets/emwa-logo-new.png";

export const Route = createFileRoute("/membership")({
  head: () => ({ meta: [
    { title: "Membership — EMWA" },
    { name: "description", content: "Join the Ethiopian Media Women Association. Explore benefits, membership categories, eligibility, and apply online." },
    { property: "og:title", content: "Membership — EMWA" },
    { property: "og:description", content: "A stronger media starts with women who stand together." },
  ] }),
  component: Membership,
});

const TIERS = [
  { name: "Associate", fee: "Free", note: "Start your journey", eligibility: "Journalism students and first-year professionals", perks: ["Member newsletter", "Regional chapter events", "Career resource library"] },
  { name: "Full Member", fee: "ETB 800", cadence: "/ year", note: "Most popular", featured: true, eligibility: "Working women journalists, producers, and editors", perks: ["Everything in Associate", "Experts Directory profile", "Safety and legal support", "Grant and fellowship priority", "Voting rights"] },
  { name: "Institutional", fee: "ETB 15,000", cadence: "/ year", note: "Build capacity together", eligibility: "Newsrooms, universities, and media organizations", perks: ["Organization-wide access", "Training partnership", "Named-partner recognition", "Board observer seat"] },
];

const BENEFITS = [
  { number: "01", title: "Protection", text: "Rapid legal, digital, and physical safety support when your work puts you at risk." },
  { number: "02", title: "Opportunity", text: "Priority access to training, leadership fellowships, grants, and reporting funds." },
  { number: "03", title: "Visibility", text: "A verified profile connecting your expertise with newsrooms and decision-makers." },
  { number: "04", title: "Belonging", text: "A nationwide peer network with regional chapters and regular member gatherings." },
];

const FAQ = [
  { q: "Who can join EMWA?", a: "Any Ethiopian woman working in — or studying toward a career in — journalism, broadcasting, communications, or academic media studies." },
  { q: "How long does an application take?", a: "Approvals typically take 5–10 working days after we receive a complete application." },
  { q: "Do I need to be based in Ethiopia?", a: "No. Diaspora members are welcome and are connected through the International chapter." },
  { q: "How do I pay the membership fee?", a: "You can pay by CBE Birr, Telebirr, or bank transfer after approval. Fee waivers are available on request." },
];

const STEPS = ["About you", "Your work", "Membership", "Review"] as const;
type FormData = { name: string; email: string; phone: string; outlet: string; role: string; region: string; tier: string };
const INITIAL_FORM: FormData = { name: "", email: "", phone: "", outlet: "", role: "", region: "", tier: "Full Member" };

function Membership() {
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const update = (field: keyof FormData, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const chooseTier = (tier: string) => {
    update("tier", tier); setStep(2);
    document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); };

  return <PageShell>
    <section className="membership-hero" aria-labelledby="membership-title">
      <div className="membership-hero-main">
        <p className="membership-kicker"><span /> Membership · Est. 2013</p>
        <h1 id="membership-title">Grow your career.<br /><em>Strengthen your voice.</em></h1>
        <p className="membership-hero-copy">Join a professional community of Ethiopian women in media, with access to support, learning opportunities, and meaningful connections.</p>
        <div className="membership-hero-actions">
          <a href="#categories" className="membership-primary-action">Explore membership <ArrowDown aria-hidden="true" /></a>
          <a href="#benefits" className="membership-text-action">See what membership unlocks <ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
      <aside className="membership-hero-aside" aria-label="EMWA membership at a glance">
        <div className="membership-orbit" aria-hidden="true"><span><img src={logo} alt="" /></span></div>
        <blockquote>A professional community built to help women in Ethiopian media connect, grow, and lead.</blockquote>
        <div className="membership-hero-stats"><p><strong>12</strong><span>Regional chapters</span></p><p><strong>1</strong><span>Shared voice</span></p></div>
      </aside>
    </section>

    <section className="membership-promise" aria-label="Our membership promise"><Sparkles aria-hidden="true" /><p>More than a membership card.</p><span>A professional home built by and for women in Ethiopian media.</span></section>

    <section className="membership-categories" id="categories" aria-labelledby="categories-title">
      <header><div><p className="membership-kicker membership-kicker-light"><span /> Membership paths</p><h2 id="categories-title">Choose where<br />you belong.</h2></div><p>Every path connects you to the same mission. Choose the category matching where you are today.</p></header>
      <div className="membership-tier-grid">{TIERS.map((tier) => <article key={tier.name} className={tier.featured ? "is-featured" : ""}>
        <div className="membership-tier-top"><span>{tier.note}</span>{tier.featured && <b>Recommended</b>}</div><h3>{tier.name}</h3><p className="membership-tier-price">{tier.fee} <small>{tier.cadence}</small></p><p className="membership-tier-eligibility">{tier.eligibility}</p>
        <ul>{tier.perks.map((perk) => <li key={perk}><Check aria-hidden="true" />{perk}</li>)}</ul><button type="button" onClick={() => chooseTier(tier.name)}>Choose {tier.name} <ArrowRight aria-hidden="true" /></button>
      </article>)}</div>
    </section>

    <section className="membership-benefits" id="benefits" aria-labelledby="benefits-title">
      <header><p className="membership-kicker"><span /> The difference</p><h2 id="benefits-title">What becomes possible<br />when we move <em>together.</em></h2></header>
      <div className="membership-benefit-list">{BENEFITS.map((benefit) => <article key={benefit.number}><span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p>{benefit.number === "01" ? <ShieldCheck aria-hidden="true" /> : <Users aria-hidden="true" />}</article>)}</div>
    </section>

    <section className="membership-application" id="apply" aria-labelledby="application-title">
      <div className="membership-application-intro"><p className="membership-kicker"><span /> Your application</p><h2 id="application-title">Take your seat<br />at the table.</h2><p>Four short steps. Your details stay in place as you move through the application.</p><div className="membership-application-note"><strong>5–10</strong><span>Working days<br />for review</span></div></div>
      <form className="membership-form" onSubmit={submit}>
        <ol className="membership-progress" aria-label="Application progress">{STEPS.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-complete" : ""} aria-current={index === step ? "step" : undefined}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span><small>{label}</small></li>)}</ol>
        <div className="membership-form-panel">{submitted ? <div className="membership-success" role="status"><span><Check aria-hidden="true" /></span><p className="membership-kicker">Application prepared</p><h3>Thank you, {form.name || "future member"}.</h3><p>Your details are ready. Connect this form to your preferred submission service to begin receiving applications.</p><Link to="/contact">Contact the membership team <ArrowRight aria-hidden="true" /></Link></div> : <>
          {step === 0 && <fieldset><legend>Let&apos;s start with you.</legend><p>Tell us how the membership team can reach you.</p><div className="membership-fields"><label><span>Full name *</span><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" autoComplete="name" /></label><label><span>Email address *</span><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" /></label><label className="is-wide"><span>Phone number *</span><input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+251 ..." autoComplete="tel" /></label></div></fieldset>}
          {step === 1 && <fieldset><legend>Tell us about your work.</legend><p>Students can enter their institution and area of study.</p><div className="membership-fields"><label><span>Outlet or institution *</span><input required value={form.outlet} onChange={(e) => update("outlet", e.target.value)} placeholder="Organization name" /></label><label><span>Current role *</span><input required value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="e.g. Reporter, student" /></label><label className="is-wide"><span>Region or chapter *</span><input required value={form.region} onChange={(e) => update("region", e.target.value)} placeholder="e.g. Addis Ababa" /></label></div></fieldset>}
          {step === 2 && <fieldset><legend>Choose your membership.</legend><p>You can change your category before submitting.</p><div className="membership-tier-options">{TIERS.map((tier) => <label key={tier.name} className={form.tier === tier.name ? "is-selected" : ""}><input type="radio" name="tier" value={tier.name} checked={form.tier === tier.name} onChange={(e) => update("tier", e.target.value)} /><span><strong>{tier.name}</strong><small>{tier.eligibility}</small></span><b>{tier.fee}</b></label>)}</div></fieldset>}
          {step === 3 && <fieldset><legend>Everything look right?</legend><p>Review your details before preparing the application.</p><dl className="membership-review"><div><dt>Name</dt><dd>{form.name || "Not provided"}</dd></div><div><dt>Email</dt><dd>{form.email || "Not provided"}</dd></div><div><dt>Professional home</dt><dd>{form.outlet || "Not provided"}</dd></div><div><dt>Membership</dt><dd>{form.tier}</dd></div></dl></fieldset>}
          <div className="membership-form-actions"><button type="button" className="is-back" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ArrowLeft aria-hidden="true" /> Back</button>{step < STEPS.length - 1 ? <button type="button" className="is-next" onClick={() => setStep((current) => current + 1)}>Continue <ArrowRight aria-hidden="true" /></button> : <button type="submit" className="is-next">Prepare application <ArrowRight aria-hidden="true" /></button>}</div>
        </>}</div><p className="membership-privacy">By continuing, you agree that EMWA may use these details to review and respond to your membership application.</p>
      </form>
    </section>

    <section className="membership-faq" aria-labelledby="faq-title"><header><p className="membership-kicker"><span /> Good to know</p><h2 id="faq-title">Questions,<br /><em>answered.</em></h2></header><div className="membership-faq-list">{FAQ.map((item, index) => { const isOpen = openFaq === index; return <article key={item.q} className={isOpen ? "is-open" : ""}><h3><button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={`membership-answer-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{item.q}<ChevronDown aria-hidden="true" /></button></h3><div id={`membership-answer-${index}`} hidden={!isOpen}><p>{item.a}</p></div></article>; })}<p className="membership-faq-contact">Still wondering about something? <Link to="/contact">Talk to our membership team <ArrowRight aria-hidden="true" /></Link></p></div></section>
  </PageShell>;
}
