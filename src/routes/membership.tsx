import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import logo from "@/assets/emwa-logo-new.png";
import { API_BASE } from "@/lib/admin-api";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — EMWA" },
      {
        name: "description",
        content:
          "Join the Ethiopian Media Women Association. Explore benefits, membership categories, eligibility, and apply online.",
      },
      { property: "og:title", content: "Membership — EMWA" },
      {
        property: "og:description",
        content: "A stronger media starts with women who stand together.",
      },
    ],
  }),
  component: Membership,
});

const TIERS = [
  {
    name: "Associate",
    fee: "ETB 300",
    cadence: "/ year",
    note: "Supporting membership",
    eligibility: "Male journalists, journalism students, and practicing journalists without formal journalism education",
    perks: ["Member newsletter", "Regional chapter events", "Career resource library"],
  },
  {
    name: "Full Member",
    fee: "ETB 600",
    cadence: "/ year",
    note: "Most popular",
    featured: true,
    eligibility: "Women with at least one year of journalism experience",
    perks: [
      "Everything in Associate",
      "Experts Directory profile",
      "Safety and legal support",
      "Grant and fellowship priority",
      "Voting rights",
    ],
  },
  {
    name: "Honorary Member",
    fee: "By support",
    note: "Support EMWA",
    eligibility: "Individuals interested in providing financial, in-kind, or other support",
    perks: [
      "Association updates",
      "Community invitations",
      "Recognition of support",
    ],
  },
];

const BENEFITS = [
  {
    number: "01",
    title: "Protection",
    text: "Rapid legal, digital, and physical safety support when your work puts you at risk.",
  },
  {
    number: "02",
    title: "Opportunity",
    text: "Priority access to training, leadership fellowships, grants, and reporting funds.",
  },
  {
    number: "03",
    title: "Visibility",
    text: "A verified profile connecting your expertise with newsrooms and decision-makers.",
  },
  {
    number: "04",
    title: "Belonging",
    text: "A nationwide peer network with regional chapters and regular member gatherings.",
  },
];

const FAQ = [
  {
    q: "Who are members of EMWA?",
    a: <>A woman media practitioner with at least one year of experience in media and communication is eligible to become a Full Member of the Association. Interested applicants must complete the <Link to="/membership" hash="apply">Registration Form</Link> to express their intent. Upon approval by EMWA, the applicant is required to pay the membership fee, a formal commitment that signifies active participation and support for the Association&apos;s mission.</>,
  },
  {
    q: "Can men join EMWA?",
    a: <>Yes. Men may join as Associate Members. They must complete the <Link to="/membership" hash="apply">Registration Form</Link> to apply. Once EMWA reviews and approves the application, payment of the membership fee is required.</>,
  },
  {
    q: "Does EMWA have branch offices?",
    a: "No. EMWA operates through elected members organized under committees, who serve as the link between members and the Association. Once committee members are elected, they serve for at least two consecutive years.",
  },
  {
    q: "What is EMWA's structure?",
    a: "The General Assembly is the highest decision-making body, convening annually. It elects a seven-member Executive Board, composed exclusively of women. The Executive Board serves a minimum term of two consecutive years.",
  },
  {
    q: "Can men be employed at EMWA?",
    a: "Yes. Except for the Executive Board and the Executive Directress, all other positions are open to both men and women.",
  },
];

const STEPS = ["Personal / የግል", "Work / የሥራ", "Membership / አባልነት", "Review / ማረጋገጫ"] as const;
type FormData = {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  citySubCity: string;
  woreda: string;
  houseNumber: string;
  additionalSkills: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  outlet: string;
  yearsOfExperience: string;
  department: string;
  role: string;
  educationLevel: string;
  fieldOfStudy: string;
  tier: string;
};
type MembershipType = {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  price_amount?: string;
  currency?: string;
};
const INITIAL_FORM: FormData = {
  name: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  citySubCity: "",
  woreda: "",
  houseNumber: "",
  additionalSkills: "",
  emergencyContact1Name: "",
  emergencyContact1Phone: "",
  emergencyContact2Name: "",
  emergencyContact2Phone: "",
  outlet: "",
  yearsOfExperience: "",
  department: "",
  role: "",
  educationLevel: "",
  fieldOfStudy: "",
  tier: "Full Member",
};

function Membership() {
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const update = (field: keyof FormData, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const chooseTier = (tier: string) => {
    const activeTier = membershipTypes.find(
      (item) => item.name.toLowerCase() === tier.toLowerCase(),
    );
    update("tier", activeTier?.name ?? membershipTypes[0]?.name ?? tier);
    setStep(0);
    document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/public/membership-types`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload?.error?.message ?? "Unable to load membership types.");
        const rows = (payload.data ?? []) as MembershipType[];
        setMembershipTypes(rows);
        if (rows.length) {
          setForm((current) =>
            rows.some((item) => item.name === current.tier)
              ? current
              : { ...current, tier: rows[0].name },
          );
        }
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setFormError(cause instanceof Error ? cause.message : "Unable to load membership types.");
      })
      .finally(() => setTypesLoading(false));
    return () => controller.abort();
  }, []);

  const validateStep = (targetStep: number) => {
    if (targetStep === 0) {
      if (form.name.trim().length < 2) return "Please enter your full name.";
      if (!form.dateOfBirth) return "Please enter your date of birth.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
      if (form.phone.trim().length < 5) return "Please enter a valid phone number.";
      if (form.citySubCity.trim().length < 2) return "Please enter your city or sub-city.";
      if (form.emergencyContact1Name.trim().length < 2)
        return "Please enter your first emergency contact.";
      if (form.emergencyContact1Phone.trim().length < 5)
        return "Please enter a valid phone number for your first emergency contact.";
    }
    if (targetStep === 1) {
      if (form.outlet.trim().length < 2) return "Please enter your organization.";
      if (!/^\d+$/.test(form.yearsOfExperience) || Number(form.yearsOfExperience) > 80)
        return "Please enter valid years of experience.";
      if (form.role.trim().length < 2) return "Please enter your current role.";
      if (form.educationLevel.trim().length < 2) return "Please enter your level of education.";
      if (form.fieldOfStudy.trim().length < 2) return "Please enter your field of study.";
    }
    if (targetStep === 2 && !membershipTypes.some((item) => item.name === form.tier)) {
      return "Please select an active membership type.";
    }
    return "";
  };

  const validateApplication = () => validateStep(0) || validateStep(1) || validateStep(2);

  const continueApplication = () => {
    const message = validateStep(step);
    if (message) {
      setFormError(message);
      return;
    }
    setFormError("");
    setStep((current) => current + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateApplication();
    if (validationError) return setFormError(validationError);
    const membershipType = membershipTypes.find(
      (item) => item.name.toLowerCase() === form.tier.toLowerCase(),
    );
    if (!membershipType) {
      return setFormError(
        "This membership type is not currently available. Please select an active option.",
      );
    }

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch(`${API_BASE}/public/membership-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipTypeId: membershipType.id,
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          outletOrInstitution: form.outlet,
          currentRole: form.role,
          regionOrChapter: form.citySubCity,
          additionalInformation: {
            dateOfBirth: form.dateOfBirth,
            citySubCity: form.citySubCity,
            woreda: form.woreda,
            houseNumber: form.houseNumber,
            additionalSkills: form.additionalSkills,
            emergencyContact1: {
              name: form.emergencyContact1Name,
              phone: form.emergencyContact1Phone,
            },
            emergencyContact2:
              form.emergencyContact2Name || form.emergencyContact2Phone
                ? {
                    name: form.emergencyContact2Name,
                    phone: form.emergencyContact2Phone,
                  }
                : undefined,
            yearsOfExperience: Number(form.yearsOfExperience),
            department: form.department,
            educationLevel: form.educationLevel,
            fieldOfStudy: form.fieldOfStudy,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error?.message ?? "Unable to submit the application.");
      setSubmitted(true);
    } catch (cause) {
      setFormError(
        cause instanceof TypeError
          ? "Cannot reach the EMWA server. Please check your connection and try again."
          : cause instanceof Error
            ? cause.message
            : "Unable to submit the application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const applicationTiers = membershipTypes.map((type) => ({
    name: type.name,
    eligibility: type.requirements || type.description || "EMWA membership category",
    fee:
      type.price_amount && Number(type.price_amount) > 0
        ? `${type.currency ?? "ETB"} ${Number(type.price_amount).toLocaleString()}`
        : "Free",
  }));

  return (
    <PageShell>
      <section className="membership-hero" aria-labelledby="membership-title">
        <div className="membership-hero-main">
          <p className="membership-kicker">
            <span /> Membership · Est. 2013
          </p>
          <h1 id="membership-title">
            Grow your career.
            <br />
            <em>Strengthen your voice.</em>
          </h1>
          <p className="membership-hero-copy">
            Join a professional community of Ethiopian women in media, with access to support,
            learning opportunities, and meaningful connections.
          </p>
          <div className="membership-hero-actions">
            <a href="#categories" className="membership-primary-action">
              Explore membership <ArrowDown aria-hidden="true" />
            </a>
            <a href="#benefits" className="membership-text-action">
              See what membership unlocks <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <aside className="membership-hero-aside" aria-label="EMWA membership at a glance">
          <div className="membership-orbit" aria-hidden="true">
            <span>
              <img src={logo} alt="" />
            </span>
          </div>
          <blockquote>
            A professional community built to help women in Ethiopian media connect, grow, and lead.
          </blockquote>
          <div className="membership-hero-stats">
            <p>
              <strong>12</strong>
              <span>Regional chapters</span>
            </p>
            <p>
              <strong>1</strong>
              <span>Shared voice</span>
            </p>
          </div>
        </aside>
      </section>

      <section className="membership-promise" aria-label="Our membership promise">
        <Sparkles aria-hidden="true" />
        <p>More than a membership card.</p>
        <span>A professional home built by and for women in Ethiopian media.</span>
      </section>

      <section className="membership-categories" id="categories" aria-labelledby="categories-title">
        <header>
          <div>
            <p className="membership-kicker membership-kicker-light">
              <span /> Membership paths
            </p>
            <h2 id="categories-title">
              Choose where
              <br />
              you belong.
            </h2>
          </div>
          <p>
            Every path connects you to the same mission. Choose the category matching where you are
            today.
          </p>
        </header>
        <div className="membership-tier-grid">
          {TIERS.map((tier) => (
            <article key={tier.name} className={tier.featured ? "is-featured" : ""}>
              <div className="membership-tier-top">
                <span>{tier.note}</span>
                {tier.featured && <b>Recommended</b>}
              </div>
              <h3>{tier.name}</h3>
              <p className="membership-tier-price">
                {tier.fee} <small>{tier.cadence}</small>
              </p>
              <p className="membership-tier-eligibility">{tier.eligibility}</p>
              <ul>
                {tier.perks.map((perk) => (
                  <li key={perk}>
                    <Check aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => chooseTier(tier.name)}>
                Choose {tier.name} <ArrowRight aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="membership-benefits" id="benefits" aria-labelledby="benefits-title">
        <header>
          <p className="membership-kicker">
            <span /> The difference
          </p>
          <h2 id="benefits-title">
            What becomes possible
            <br />
            when we move <em>together.</em>
          </h2>
        </header>
        <div className="membership-benefit-list">
          {BENEFITS.map((benefit) => (
            <article key={benefit.number}>
              <span>{benefit.number}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
              {benefit.number === "01" ? (
                <ShieldCheck aria-hidden="true" />
              ) : (
                <Users aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="membership-application" id="apply" aria-labelledby="application-title">
        <div className="membership-application-intro">
          <p className="membership-kicker">
            <span /> Your application
          </p>
          <h2 id="application-title">
            Take your seat
            <br />
            at the table.
          </h2>
          <p>The latest approved EMWA membership form, presented in four clear bilingual steps.</p>
          <div className="membership-application-note">
            <strong>5–10</strong>
            <span>
              Working days
              <br />
              for review
            </span>
          </div>
        </div>
        <form className="membership-form" onSubmit={submit}>
          <header className="membership-official-header">
            <img src={logo} alt="EMWA" />
            <div>
              <p>የኢትዮጵያ መገናኛ ብዙኃን ባለሙያ ሴቶች ማኅበር</p>
              <strong>Ethiopian Media Women Association (EMWA)</strong>
              <span>የአባልነት ምዝገባ ቅጽ / Membership Form</span>
            </div>
            <small>Official registration</small>
          </header>
          <p className="membership-official-intro">
            የኢትዮጵያ መገናኛ ብዙኃን ባለሙያ ሴቶች ማኅበር በ1991 ዓ.ም. የተቋቋመ የሙያ ማኅበር ነው።
            ሴት የመገናኛ ብዙኃንና የኮሙኒኬሽን ባለሙያዎችን፣ የጋዜጠኝነት ተማሪዎችን፣ ወንድ
            ተባባሪ አባላትን እና የክብር አባላትን ይቀበላል።
            <span>EMWA is a professional association established in 1998. It welcomes women media and communication professionals, women journalism students, male associate members, and honorary members.</span>
          </p>
          <ol className="membership-progress" aria-label="Application progress">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={index === step ? "is-current" : index < step ? "is-complete" : ""}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span>
                <small>{label}</small>
              </li>
            ))}
          </ol>
          <div className="membership-form-panel">
            {submitted ? (
              <div className="membership-success" role="status">
                <span>
                  <Check aria-hidden="true" />
                </span>
                <p className="membership-kicker">Application received</p>
                <h3>Thank you, {form.name || "future member"}.</h3>
                <p>
                  Your membership request has been sent to EMWA and is now pending administrative
                  review.
                </p>
                <Link to="/contact">
                  Contact the membership team <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <fieldset>
                    <legend>የግል መረጃ / Personal Information</legend>
                    <p>Enter your details as they should appear on your EMWA membership record.</p>
                    <div className="membership-fields">
                      <label>
                        <span>ሙሉ ስም / Full name *</span>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        <span>የትውልድ ዘመን / Date of birth *</span>
                        <input
                          required
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => update("dateOfBirth", e.target.value)}
                          autoComplete="bday"
                        />
                      </label>
                      <label>
                        <span>ኢሜል / Email address *</span>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </label>
                      <label>
                        <span>የእጅ ስልክ / Mobile number *</span>
                        <input
                          required
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="+251 ..."
                          autoComplete="tel"
                        />
                      </label>
                      <label>
                        <span>ከተማ / ክፍለ ከተማ / City / Sub-city *</span>
                        <input
                          required
                          value={form.citySubCity}
                          onChange={(e) => update("citySubCity", e.target.value)}
                          placeholder="City or sub-city"
                          autoComplete="address-level2"
                        />
                      </label>
                      <label>
                        <span>ወረዳ / Woreda</span>
                        <input
                          value={form.woreda}
                          onChange={(e) => update("woreda", e.target.value)}
                          placeholder="Woreda"
                        />
                      </label>
                      <label>
                        <span>የቤት ቁጥር / House number</span>
                        <input
                          value={form.houseNumber}
                          onChange={(e) => update("houseNumber", e.target.value)}
                          placeholder="House number"
                        />
                      </label>
                      <label className="is-wide">
                        <span>ተጨማሪ ሙያ፣ ስልጠና ወይም ክህሎት / Additional profession, training, or skills</span>
                        <textarea
                          value={form.additionalSkills}
                          onChange={(e) => update("additionalSkills", e.target.value)}
                          placeholder="List relevant additional training or skills"
                          rows={3}
                        />
                      </label>
                      <label>
                        <span>የአደጋ ጊዜ ተጠሪ 1 / Emergency contact 1 — name *</span>
                        <input
                          required
                          value={form.emergencyContact1Name}
                          onChange={(e) => update("emergencyContact1Name", e.target.value)}
                          placeholder="Full name"
                        />
                      </label>
                      <label>
                        <span>ስልክ / Emergency contact 1 — phone *</span>
                        <input
                          required
                          type="tel"
                          value={form.emergencyContact1Phone}
                          onChange={(e) => update("emergencyContact1Phone", e.target.value)}
                          placeholder="+251 ..."
                        />
                      </label>
                      <label>
                        <span>የአደጋ ጊዜ ተጠሪ 2 / Emergency contact 2 — name</span>
                        <input
                          value={form.emergencyContact2Name}
                          onChange={(e) => update("emergencyContact2Name", e.target.value)}
                          placeholder="Full name"
                        />
                      </label>
                      <label>
                        <span>ስልክ / Emergency contact 2 — phone</span>
                        <input
                          type="tel"
                          value={form.emergencyContact2Phone}
                          onChange={(e) => update("emergencyContact2Phone", e.target.value)}
                          placeholder="+251 ..."
                        />
                      </label>
                    </div>
                  </fieldset>
                )}
                {step === 1 && (
                  <fieldset>
                    <legend>የሥራ ሁኔታ / Work Experience &amp; Education</legend>
                    <p>Students may enter their institution and use 0 for years of experience.</p>
                    <div className="membership-fields">
                      <label>
                        <span>የሚሰሩበት ድርጅት / Organization *</span>
                        <input
                          required
                          value={form.outlet}
                          onChange={(e) => update("outlet", e.target.value)}
                          placeholder="Organization name"
                        />
                      </label>
                      <label>
                        <span>የሥራ ልምድ / Years of experience *</span>
                        <input
                          required
                          type="number"
                          min="0"
                          max="80"
                          value={form.yearsOfExperience}
                          onChange={(e) => update("yearsOfExperience", e.target.value)}
                          placeholder="0"
                        />
                      </label>
                      <label>
                        <span>የሥራ ዘርፍ / Department</span>
                        <input
                          value={form.department}
                          onChange={(e) => update("department", e.target.value)}
                          placeholder="Department or work area"
                        />
                      </label>
                      <label>
                        <span>የሥራ ድርሻ / Role *</span>
                        <input
                          required
                          value={form.role}
                          onChange={(e) => update("role", e.target.value)}
                          placeholder="e.g. Reporter, student"
                        />
                      </label>
                      <label>
                        <span>የትምህርት ደረጃ / Level of education *</span>
                        <input
                          required
                          value={form.educationLevel}
                          onChange={(e) => update("educationLevel", e.target.value)}
                          placeholder="e.g. Bachelor's degree"
                        />
                      </label>
                      <label>
                        <span>የትምህርት ዘርፍ / Field of study *</span>
                        <input
                          required
                          value={form.fieldOfStudy}
                          onChange={(e) => update("fieldOfStudy", e.target.value)}
                          placeholder="e.g. Journalism"
                        />
                      </label>
                    </div>
                  </fieldset>
                )}
                {step === 2 && (
                  <fieldset>
                    <legend>የአባልነት ዓይነት / Membership Type</legend>
                    <p>You can change your category before submitting.</p>
                    {typesLoading ? (
                      <p>Loading active membership typesâ€¦</p>
                    ) : applicationTiers.length ? (
                      <div className="membership-tier-options">
                        {applicationTiers.map((tier) => (
                          <label
                            key={tier.name}
                            className={form.tier === tier.name ? "is-selected" : ""}
                          >
                            <input
                              type="radio"
                              name="tier"
                              value={tier.name}
                              checked={form.tier === tier.name}
                              onChange={(e) => update("tier", e.target.value)}
                            />
                            <span>
                              <strong>{tier.name}</strong>
                              <small>{tier.eligibility}</small>
                            </span>
                            <b>{tier.fee}</b>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="membership-form-error" role="alert">
                        No active membership types are available. Please contact the membership
                        team.
                      </p>
                    )}
                  </fieldset>
                )}
                {step === 3 && (
                  <fieldset>
                    <legend>ማረጋገጫ / Review your application</legend>
                    <p>Review your details before preparing the application.</p>
                    <dl className="membership-review">
                      <div>
                        <dt>Name</dt>
                        <dd>{form.name || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{form.email || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Mobile</dt>
                        <dd>{form.phone || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Date of birth</dt>
                        <dd>{form.dateOfBirth || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Address</dt>
                        <dd>
                          {[form.citySubCity, form.woreda, form.houseNumber]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt>Organization</dt>
                        <dd>{form.outlet || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Role / Experience</dt>
                        <dd>
                          {form.role || "Not provided"} · {form.yearsOfExperience || "0"} years
                        </dd>
                      </div>
                      <div>
                        <dt>Education</dt>
                        <dd>
                          {[form.educationLevel, form.fieldOfStudy].filter(Boolean).join(" — ") ||
                            "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt>Emergency contact</dt>
                        <dd>
                          {[form.emergencyContact1Name, form.emergencyContact1Phone]
                            .filter(Boolean)
                            .join(" · ") || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt>Membership</dt>
                        <dd>{form.tier}</dd>
                      </div>
                    </dl>
                  </fieldset>
                )}
                {formError && (
                  <p className="membership-form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="membership-form-actions">
                  <button
                    type="button"
                    className="is-back"
                    onClick={() => {
                      setFormError("");
                      setStep((current) => Math.max(0, current - 1));
                    }}
                    disabled={step === 0}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      className="is-next"
                      onClick={continueApplication}
                      disabled={step === 2 && (typesLoading || !applicationTiers.length)}
                    >
                      Continue <ArrowRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" className="is-next" disabled={submitting}>
                      {submitting ? "Submittingâ€¦" : "Submit application"}{" "}
                      <ArrowRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="membership-privacy">
            By continuing, you agree that EMWA may use these details to review and respond to your
            membership application.
          </p>
        </form>
      </section>

      <section className="membership-faq" aria-labelledby="faq-title">
        <header>
          <p className="membership-kicker">
            <span /> Good to know
          </p>
          <h2 id="faq-title">
            Questions,
            <br />
            <em>answered.</em>
          </h2>
        </header>
        <div className="membership-faq-list">
          {FAQ.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <article key={item.q} className={isOpen ? "is-open" : ""}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`membership-answer-${index}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.q}
                    <ChevronDown aria-hidden="true" />
                  </button>
                </h3>
                <div id={`membership-answer-${index}`} hidden={!isOpen}>
                  <p>{item.a}</p>
                </div>
              </article>
            );
          })}
          <p className="membership-faq-contact">
            Still wondering about something?{" "}
            <Link to="/contact">
              Talk to our membership team <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
