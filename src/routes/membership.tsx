import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — EMWA" },
      { name: "description", content: "Apply for membership with the Ethiopian Media Women Association. Tiers, benefits, eligibility, and online application." },
      { property: "og:title", content: "Membership — EMWA" },
      { property: "og:description", content: "Join EMWA — tiers, benefits, eligibility, and online application." },
    ],
  }),
  component: Membership,
});

const TIERS = [
  {
    name: "Associate",
    fee: "Free",
    eligibility: "Journalism students & first-year professionals",
    perks: ["Access to member newsletter", "Regional chapter events", "Career resource library"],
  },
  {
    name: "Full Member",
    fee: "ETB 800 / yr",
    featured: true,
    eligibility: "Working women journalists, producers, editors",
    perks: ["All Associate benefits", "Experts Directory listing", "Digital safety support", "Grant & fellowship priority", "Voting rights"],
  },
  {
    name: "Institutional",
    fee: "ETB 15,000 / yr",
    eligibility: "Newsrooms, universities, and media organizations",
    perks: ["All Full Member benefits", "Training partnership", "Named-partner recognition", "Board observer seat"],
  },
];

const BENEFITS = [
  { h: "Legal & Safety Support", b: "Rapid-response legal, digital, and physical safety help." },
  { h: "Training & Fellowships", b: "Priority access to leadership incubators and residencies." },
  { h: "Experts Directory", b: "Verified public profile as a subject-matter expert." },
  { h: "Regional Network", b: "Twelve chapters. Monthly convenings across the country." },
  { h: "Grants Access", b: "Eligibility for micro-grants and reporting funds." },
  { h: "Voting Rights", b: "Vote for the executive board and annual resolutions." },
];

const FAQ = [
  { q: "Who can join EMWA?", a: "Any Ethiopian woman working in — or studying toward a career in — journalism, broadcasting, communications, or academic media studies." },
  { q: "How long does the application take?", a: "Approvals typically take 5–10 working days from submission of a complete application." },
  { q: "Do I need to be based in Ethiopia?", a: "No. Diaspora members are welcome and are assigned to the International chapter." },
  { q: "How do I pay membership fees?", a: "By CBE Birr, Telebirr, or bank transfer. Fee waivers are available on request." },
];

const STEPS = ["Your details", "Professional info", "Category", "Review"] as const;

function Membership() {
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PageShell>
      <PageHero
        eyebrow="Membership"
        title={<>Add your <span className="text-primary">voice</span> to the association.</>}
        lede="EMWA is member-led. Every training, grant, and policy brief starts with the working women of Ethiopian media."
      />

      {/* Benefits grid */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Why Join</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">Six things you get on day one.</h2>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {BENEFITS.map((b) => (
              <a
                key={b.h}
                href="#apply"
                className="group bg-background p-10 hover:bg-muted/50 transition-colors block"
              >
                <p className="font-display text-3xl mb-4 group-hover:text-primary transition-colors">{b.h}</p>
                <p className="text-muted-foreground mb-6">{b.b}</p>
                <span className="label-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  Apply now <ArrowRight className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>


      {/* Tiers */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-accent mb-4">Categories</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">Three tiers.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`p-10 border transition-all ${t.featured ? "bg-primary border-primary text-primary-foreground scale-[1.02]" : "border-background/20 hover:border-accent"}`}
              >
                {t.featured && <p className="label-mono text-accent mb-2">Recommended</p>}
                <p className="font-display text-4xl mb-2">{t.name}</p>
                <p className="font-display text-5xl mb-6">{t.fee}</p>
                <p className="text-sm opacity-80 mb-6 border-t border-current/20 pt-4">{t.eligibility}</p>
                <ul className="space-y-3">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2 items-start text-sm">
                      <Check className="size-4 mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="apply" className="py-24 scroll-mt-24">

        <div className="max-w-3xl mx-auto px-6">
          <p className="label-mono text-primary mb-4">Application</p>
          <h2 className="font-display text-5xl md:text-6xl mb-12">Apply in four steps.</h2>

          {/* Progress */}
          <div className="flex gap-2 mb-10">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 transition-all ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="flex justify-between label-mono mb-10">
            {STEPS.map((s, i) => (
              <span key={s} className={i === step ? "text-primary" : i < step ? "" : "text-muted-foreground"}>
                {i + 1}. {s}
              </span>
            ))}
          </div>

          <div className="border border-border p-8 md:p-12 min-h-[320px]">
            {step === 0 && (
              <div className="space-y-5 animate-fade">
                <div>
                  <label className="label-mono block mb-2">Full name</label>
                  <input className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" placeholder="Aster Bekele" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Email</label>
                  <input type="email" className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" placeholder="you@example.et" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Phone</label>
                  <input className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" placeholder="+251 ..." />
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5 animate-fade">
                <div>
                  <label className="label-mono block mb-2">Current outlet</label>
                  <input className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Role</label>
                  <input className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Region</label>
                  <input className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3 animate-fade">
                <p className="label-mono mb-4">Select category</p>
                {TIERS.map((t) => (
                  <label key={t.name} className="flex gap-3 items-start border border-border p-4 cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="tier" className="mt-1" />
                    <div>
                      <p className="font-display text-2xl">{t.name} — {t.fee}</p>
                      <p className="text-sm text-muted-foreground">{t.eligibility}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="animate-fade">
                <p className="label-mono text-primary mb-4">Review</p>
                <p className="font-display text-3xl mb-6">Ready to submit.</p>
                <p className="text-muted-foreground mb-8">Please review your application. You'll receive a confirmation email and a decision within 5–10 working days.</p>
                <button className="bg-primary text-primary-foreground px-8 py-3 label-mono hover:bg-foreground transition-colors inline-flex items-center gap-2">
                  Submit application <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="label-mono border border-border px-5 py-2 disabled:opacity-40"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep(step + 1)}
                className="label-mono bg-foreground text-background px-5 py-2 hover:bg-primary transition-colors"
              >
                Continue →
              </button>
            )}
          </div>

          <div className="mt-10 flex justify-between label-mono">
            <a href="#" className="text-primary hover:underline">↓ Download membership guidelines (PDF)</a>
            <Link to="/contact" className="hover:text-primary">Questions? Contact us →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="label-mono text-primary mb-4">FAQs</p>
          <h2 className="font-display text-5xl md:text-6xl mb-12">Common questions.</h2>
          <div className="border-t border-foreground">
            {FAQ.map((f, i) => (
              <div key={f.q} className="border-b border-foreground">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-6 text-left"
                >
                  <span className="font-display text-2xl">{f.q}</span>
                  <span className="label-mono text-primary">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="pb-6 text-muted-foreground animate-fade">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
