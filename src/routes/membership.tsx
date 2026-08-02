import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useLanguage } from "@/lib/language-context";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

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

const STEPS = {
  en: ["Personal", "Work", "Membership", "Review"],
  am: ["የግል", "የሥራ", "አባልነት", "ማረጋገጫ"],
} as const;
type FormData = {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  phoneCountry: CountryCode;
  citySubCity: string;
  woreda: string;
  houseNumber: string;
  additionalSkills: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact1Country: CountryCode;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyContact2Country: CountryCode;
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
  phoneCountry: "ET",
  citySubCity: "",
  woreda: "",
  houseNumber: "",
  additionalSkills: "",
  emergencyContact1Name: "",
  emergencyContact1Phone: "",
  emergencyContact1Country: "ET",
  emergencyContact2Name: "",
  emergencyContact2Phone: "",
  emergencyContact2Country: "ET",
  outlet: "",
  yearsOfExperience: "",
  department: "",
  role: "",
  educationLevel: "",
  fieldOfStudy: "",
  tier: "Full Member",
};

const MEMBERSHIP_FIELD_LABELS: Record<string, string> = {
  membershipTypeId: "Membership type",
  fullName: "Full name",
  email: "Email address",
  phone: "Mobile number",
  outletOrInstitution: "Organization",
  currentRole: "Current role",
  regionOrChapter: "City or sub-city",
  additionalInformation: "Additional application information",
  dateOfBirth: "Date of birth",
  citySubCity: "City or sub-city",
  emergencyContact1: "First emergency contact",
  emergencyContact2: "Second emergency contact",
  yearsOfExperience: "Years of experience",
  educationLevel: "Level of education",
  fieldOfStudy: "Field of study",
};

const friendlyRuleMessage = (label: string, message: string) => {
  const rule = message.toLowerCase();
  if (rule.includes("required") || rule.includes("received undefined") || rule.includes("too small"))
    return `${label} is required.`;
  if (rule.includes("email")) return "Please enter a valid email address.";
  if (rule.includes("uuid")) return `Please select a valid ${label.toLowerCase()}.`;
  if (rule.includes("date")) return `Please enter a valid ${label.toLowerCase()}.`;
  if (rule.includes("too big") || rule.includes("maximum")) return `${label} is too long.`;
  if (rule.includes("number") || rule.includes("integer"))
    return `${label} must be a valid whole number.`;
  return `${label} is invalid. Please check it and try again.`;
};

const getMembershipSubmissionError = (payload: unknown, status: number) => {
  const response = payload as {
    error?: {
      code?: string;
      message?: string;
      details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    };
  } | null;
  const error = response?.error;
  const fieldErrors = error?.details?.fieldErrors;

  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (!messages?.length) continue;
      const label = MEMBERSHIP_FIELD_LABELS[field] ?? "This field";
      return friendlyRuleMessage(label, messages[0]);
    }
  }

  if (error?.details?.formErrors?.length)
    return friendlyRuleMessage("Application information", error.details.formErrors[0]);
  if (status === 409 || error?.code === "CONFLICT")
    return "An application with these details already exists. Please check your information or contact EMWA.";
  if (status >= 500)
    return "The EMWA server could not process your application right now. Please try again shortly.";
  if (error?.code === "VALIDATION_ERROR")
    return "Some application details are missing or invalid. Please review the form and try again.";
  return error?.message || "Unable to submit the application. Please try again.";
};

const countryFlag = (country: CountryCode) =>
  String.fromCodePoint(...country.split("").map((letter) => 127397 + letter.charCodeAt(0)));

function InternationalPhoneField({
  country,
  value,
  onCountryChange,
  onChange,
  required,
  language,
  label,
}: {
  country: CountryCode;
  value: string;
  onCountryChange: (country: CountryCode) => void;
  onChange: (value: string) => void;
  required?: boolean;
  language: "en" | "am";
  label: string;
}) {
  const names = useMemo(
    () => new Intl.DisplayNames([language], { type: "region" }),
    [language],
  );
  const countries = useMemo(
    () =>
      getCountries()
        .map((code) => ({ code, name: names.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` }))
        .sort((a, b) => a.name.localeCompare(b.name, language)),
    [language, names],
  );

  const changeCountry = (nextCountry: CountryCode) => {
    const oldDial = `+${getCountryCallingCode(country)}`;
    const nextDial = `+${getCountryCallingCode(nextCountry)}`;
    const national = value.startsWith(oldDial)
      ? value.slice(oldDial.length).replace(/^0+/, "")
      : value.replace(/^\+?\d*/, "").replace(/^0+/, "");
    onCountryChange(nextCountry);
    onChange(national ? `${nextDial}${national}` : "");
  };

  const changeNumber = (raw: string) => {
    const cleaned = raw.replace(/[^\d+]/g, "");
    if (!cleaned) return onChange("");
    if (cleaned.startsWith("+")) return onChange(`+${cleaned.slice(1).replace(/\D/g, "")}`);
    onChange(`+${getCountryCallingCode(country)}${cleaned.replace(/^0+/, "")}`);
  };

  return (
    <label>
      <span>{label}</span>
      <div className="membership-phone-field">
        <span className="membership-country-flag" aria-hidden="true">
          {countryFlag(country)}
        </span>
        <select
          value={country}
          onChange={(event) => changeCountry(event.target.value as CountryCode)}
          aria-label={language === "am" ? "ሀገር ይምረጡ" : "Select country"}
        >
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {countryFlag(item.code)} {item.name} ({item.dial})
            </option>
          ))}
        </select>
        <input
          required={required}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(event) => changeNumber(event.target.value)}
          placeholder={`+${getCountryCallingCode(country)}`}
          autoComplete="tel"
        />
      </div>
    </label>
  );
}

function Membership() {
  const { language, t } = useLanguage();
  const notProvided = t("Not provided", "አልተሰጠም");
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const update = (field: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (formError) setFormError("");
  };
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
      if (!form.name.trim()) return "Full name is required.";
      if (form.name.trim().length < 2) return "Full name must contain at least 2 characters.";
      if (!form.dateOfBirth) return "Date of birth is required.";
      if (!form.email.trim()) return "Email address is required.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
      if (!form.phone.trim()) return "Mobile number is required.";
      if (!parsePhoneNumberFromString(form.phone)?.isValid())
        return "Please enter a valid mobile number for the selected country.";
      if (!form.citySubCity.trim()) return "City or sub-city is required.";
      if (form.citySubCity.trim().length < 2) return "Please enter a valid city or sub-city.";
      if (!form.emergencyContact1Name.trim()) return "First emergency contact name is required.";
      if (form.emergencyContact1Name.trim().length < 2)
        return "First emergency contact name must contain at least 2 characters.";
      if (!form.emergencyContact1Phone.trim()) return "First emergency contact phone is required.";
      if (!parsePhoneNumberFromString(form.emergencyContact1Phone)?.isValid())
        return "Please enter a valid phone number for your first emergency contact's country.";
      if (
        form.emergencyContact2Phone &&
        !parsePhoneNumberFromString(form.emergencyContact2Phone)?.isValid()
      )
        return "Please enter a valid phone number for your second emergency contact's country.";
    }
    if (targetStep === 1) {
      if (!form.outlet.trim()) return "Organization is required.";
      if (form.outlet.trim().length < 2) return "Organization must contain at least 2 characters.";
      if (!form.yearsOfExperience) return "Years of experience is required.";
      if (!/^\d+$/.test(form.yearsOfExperience) || Number(form.yearsOfExperience) > 80)
        return "Years of experience must be a whole number between 0 and 80.";
      if (!form.role.trim()) return "Current role is required.";
      if (form.role.trim().length < 2) return "Current role must contain at least 2 characters.";
      if (!form.educationLevel.trim()) return "Level of education is required.";
      if (form.educationLevel.trim().length < 2) return "Please enter a valid level of education.";
      if (!form.fieldOfStudy.trim()) return "Field of study is required.";
      if (form.fieldOfStudy.trim().length < 2) return "Please enter a valid field of study.";
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
      if (!response.ok) throw new Error(getMembershipSubmissionError(payload, response.status));
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
              <strong>{t("Ethiopian Media Women Association (EMWA)", "የኢትዮጵያ መገናኛ ብዙኃን ባለሙያ ሴቶች ማኅበር (EMWA)")}</strong>
              <span>{t("Membership Form", "የአባልነት ምዝገባ ቅጽ")}</span>
            </div>
            <small>{t("Official registration", "መደበኛ ምዝገባ")}</small>
          </header>
          <p className="membership-official-intro">
            {language === "am" && <>
            የኢትዮጵያ መገናኛ ብዙኃን ባለሙያ ሴቶች ማኅበር በ1991 ዓ.ም. የተቋቋመ የሙያ ማኅበር ነው።
            ሴት የመገናኛ ብዙኃንና የኮሙኒኬሽን ባለሙያዎችን፣ የጋዜጠኝነት ተማሪዎችን፣ ወንድ
            ተባባሪ አባላትን እና የክብር አባላትን ይቀበላል።
            </>}
            {language === "en" && <span>EMWA is a professional association established in 1998. It welcomes women media and communication professionals, women journalism students, male associate members, and honorary members.</span>}
          </p>
          <ol className="membership-progress" aria-label="Application progress">
            {STEPS[language].map((label, index) => (
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
              <p className="membership-kicker">{t("Application received", "ማመልከቻው ደርሷል")}</p>
                <h3>{t("Thank you", "እናመሰግናለን")}, {form.name || t("future member", "የወደፊት አባል")}.</h3>
                <p>
                  {t("Your membership request has been sent to EMWA and is now pending administrative review.", "የአባልነት ጥያቄዎ ለEMWA ተልኳል፤ አሁን የአስተዳደር ግምገማን በመጠበቅ ላይ ነው።")}
                </p>
                <Link to="/contact">
                  {t("Contact the membership team", "የአባልነት ቡድኑን ያነጋግሩ")} <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <fieldset>
                    <legend>{t("Personal Information", "የግል መረጃ")}</legend>
                    <p>{t("Enter your details as they should appear on your EMWA membership record.", "በEMWA የአባልነት መዝገብዎ ላይ እንዲታዩ የሚፈልጓቸውን መረጃዎች ያስገቡ።")}</p>
                    <div className="membership-fields">
                      <label>
                        <span>{t("Full name *", "ሙሉ ስም *")}</span>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        <span>{t("Date of birth *", "የትውልድ ቀን *")}</span>
                        <input
                          required
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => update("dateOfBirth", e.target.value)}
                          autoComplete="bday"
                        />
                      </label>
                      <label>
                        <span>{t("Email address *", "ኢሜይል አድራሻ *")}</span>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </label>
                      <InternationalPhoneField
                        required
                        language={language}
                        label={t("Mobile number *", "የሞባይል ስልክ ቁጥር *")}
                        country={form.phoneCountry}
                        value={form.phone}
                        onCountryChange={(country) => update("phoneCountry", country)}
                        onChange={(value) => update("phone", value)}
                      />
                      <label>
                        <span>{t("City / Sub-city *", "ከተማ / ክፍለ ከተማ *")}</span>
                        <input
                          required
                          value={form.citySubCity}
                          onChange={(e) => update("citySubCity", e.target.value)}
                          placeholder="City or sub-city"
                          autoComplete="address-level2"
                        />
                      </label>
                      <label>
                        <span>{t("Woreda", "ወረዳ")}</span>
                        <input
                          value={form.woreda}
                          onChange={(e) => update("woreda", e.target.value)}
                          placeholder="Woreda"
                        />
                      </label>
                      <label>
                        <span>{t("House number", "የቤት ቁጥር")}</span>
                        <input
                          value={form.houseNumber}
                          onChange={(e) => update("houseNumber", e.target.value)}
                          placeholder="House number"
                        />
                      </label>
                      <label className="is-wide">
                        <span>{t("Additional profession, training, or skills", "ተጨማሪ ሙያ፣ ስልጠና ወይም ክህሎት")}</span>
                        <textarea
                          value={form.additionalSkills}
                          onChange={(e) => update("additionalSkills", e.target.value)}
                          placeholder="List relevant additional training or skills"
                          rows={3}
                        />
                      </label>
                      <label>
                        <span>{t("Emergency contact 1 — name *", "የአደጋ ጊዜ ተጠሪ 1 — ስም *")}</span>
                        <input
                          required
                          value={form.emergencyContact1Name}
                          onChange={(e) => update("emergencyContact1Name", e.target.value)}
                          placeholder="Full name"
                        />
                      </label>
                      <InternationalPhoneField
                        required
                        language={language}
                        label={t("Emergency contact 1 — phone *", "የአደጋ ጊዜ ተጠሪ 1 — ስልክ *")}
                        country={form.emergencyContact1Country}
                        value={form.emergencyContact1Phone}
                        onCountryChange={(country) => update("emergencyContact1Country", country)}
                        onChange={(value) => update("emergencyContact1Phone", value)}
                      />
                      <label>
                        <span>{t("Emergency contact 2 — name", "የአደጋ ጊዜ ተጠሪ 2 — ስም")}</span>
                        <input
                          value={form.emergencyContact2Name}
                          onChange={(e) => update("emergencyContact2Name", e.target.value)}
                          placeholder="Full name"
                        />
                      </label>
                      <InternationalPhoneField
                        language={language}
                        label={t("Emergency contact 2 — phone", "የአደጋ ጊዜ ተጠሪ 2 — ስልክ")}
                        country={form.emergencyContact2Country}
                        value={form.emergencyContact2Phone}
                        onCountryChange={(country) => update("emergencyContact2Country", country)}
                        onChange={(value) => update("emergencyContact2Phone", value)}
                      />
                    </div>
                  </fieldset>
                )}
                {step === 1 && (
                  <fieldset>
                    <legend>{t("Work Experience & Education", "የሥራ ልምድ እና ትምህርት")}</legend>
                    <p>{t("Students may enter their institution and use 0 for years of experience.", "ተማሪዎች የትምህርት ተቋማቸውን በማስገባት ለሥራ ልምድ 0 መጠቀም ይችላሉ።")}</p>
                    <div className="membership-fields">
                      <label>
                        <span>{t("Organization *", "የሚሰሩበት ድርጅት *")}</span>
                        <input
                          required
                          value={form.outlet}
                          onChange={(e) => update("outlet", e.target.value)}
                          placeholder="Organization name"
                        />
                      </label>
                      <label>
                        <span>{t("Years of experience *", "የሥራ ልምድ በዓመት *")}</span>
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
                        <span>{t("Department", "የሥራ ዘርፍ")}</span>
                        <input
                          value={form.department}
                          onChange={(e) => update("department", e.target.value)}
                          placeholder="Department or work area"
                        />
                      </label>
                      <label>
                        <span>{t("Role *", "የሥራ ድርሻ *")}</span>
                        <input
                          required
                          value={form.role}
                          onChange={(e) => update("role", e.target.value)}
                          placeholder="e.g. Reporter, student"
                        />
                      </label>
                      <label>
                        <span>{t("Level of education *", "የትምህርት ደረጃ *")}</span>
                        <input
                          required
                          value={form.educationLevel}
                          onChange={(e) => update("educationLevel", e.target.value)}
                          placeholder="e.g. Bachelor's degree"
                        />
                      </label>
                      <label>
                        <span>{t("Field of study *", "የትምህርት ዘርፍ *")}</span>
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
                    <legend>{t("Membership Type", "የአባልነት ዓይነት")}</legend>
                    <p>{t("You can change your category before submitting.", "ከማስገባትዎ በፊት የአባልነት ምድብዎን መቀየር ይችላሉ።")}</p>
                    {typesLoading ? (
                      <p>{t("Loading active membership types…", "የአባልነት ዓይነቶችን በመጫን ላይ…")}</p>
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
                    <legend>{t("Review your application", "ማመልከቻዎን ያረጋግጡ")}</legend>
                    <p>{t("Review your details before submitting the application.", "ማመልከቻውን ከማስገባትዎ በፊት መረጃዎችዎን ያረጋግጡ።")}</p>
                    <dl className="membership-review">
                      <div>
                        <dt>{t("Name", "ስም")}</dt>
                        <dd>{form.name || notProvided}</dd>
                      </div>
                      <div>
                        <dt>{t("Email", "ኢሜይል")}</dt>
                        <dd>{form.email || notProvided}</dd>
                      </div>
                      <div>
                        <dt>{t("Mobile", "ሞባይል")}</dt>
                        <dd>{form.phone || notProvided}</dd>
                      </div>
                      <div>
                        <dt>{t("Date of birth", "የትውልድ ቀን")}</dt>
                        <dd>{form.dateOfBirth || notProvided}</dd>
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
                        <dt>{t("Organization", "ድርጅት")}</dt>
                        <dd>{form.outlet || notProvided}</dd>
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
                    <ArrowLeft aria-hidden="true" /> {t("Back", "ተመለስ")}
                  </button>
                  {step < STEPS.en.length - 1 ? (
                    <button
                      type="button"
                      className="is-next"
                      onClick={continueApplication}
                      disabled={step === 2 && (typesLoading || !applicationTiers.length)}
                    >
                      {t("Continue", "ቀጥል")} <ArrowRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" className="is-next" disabled={submitting}>
                      {submitting ? t("Submitting…", "በማስገባት ላይ…") : t("Submit application", "ማመልከቻውን አስገባ")}{" "}
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
