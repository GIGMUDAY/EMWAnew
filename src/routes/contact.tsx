import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Send,
  X,
  Youtube,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EMWA" },
      { name: "description", content: "Contact the Ethiopian Media Women Association." },
      { property: "og:title", content: "Contact — EMWA" },
    ],
  }),
  component: Contact,
});

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com/", icon: Youtube },
];

function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/public/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.get("fullName"),
          email: values.get("email"),
          companyName: values.get("companyName"),
          subject: values.get("subject"),
          message: values.get("message"),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const fieldErrors = payload?.error?.details?.fieldErrors as
          Record<string, string[] | undefined> | undefined;
        const firstError = fieldErrors
          ? Object.values(fieldErrors).find((messages) => messages?.length)?.[0]
          : undefined;
        throw new Error(firstError ?? payload?.error?.message ?? "Unable to send your message.");
      }
      form.reset();
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? "Cannot reach the EMWA server. Please check your connection and try again."
          : cause instanceof Error
            ? cause.message
            : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <section className="contact3-hero">
        <p className="contact3-eyebrow">Contact / EMWA</p>
        <h1>
          Start a <em>conversation.</em>
        </h1>
        <p>Have a question, an idea, or a reason to work together? Send us a message.</p>
      </section>

      <section className="contact3-main" id="donate">
        <form onSubmit={submitMessage}>
          <header>
            <p className="contact3-eyebrow">Write to us</p>
            <h2>Send a message.</h2>
          </header>
          <div className="contact3-fields">
            <label>
              <span>Your name</span>
              <input
                name="fullName"
                autoComplete="name"
                placeholder="Full name"
                minLength={2}
                maxLength={150}
                required
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={320}
                required
              />
            </label>
            <label className="is-wide">
              <span>Company name</span>
              <input
                name="companyName"
                autoComplete="organization"
                placeholder="Organization or company"
                maxLength={200}
              />
            </label>
            <label className="is-wide">
              <span>Subject</span>
              <select name="subject" defaultValue="" required>
                <option value="" disabled>
                  Select a subject
                </option>
                <option>Membership</option>
                <option>Partnership</option>
                <option>Media enquiry</option>
                <option>Programme collaboration</option>
                <option>Other</option>
              </select>
            </label>
            <label className="is-wide">
              <span>Message</span>
              <textarea
                name="message"
                rows={5}
                minLength={10}
                maxLength={10000}
                placeholder="How can we help?"
                required
              />
            </label>
          </div>
          <button type="submit" className={sent ? "is-sent" : ""} disabled={sending || sent}>
            {sent ? (
              <>
                <Check /> Message sent
              </>
            ) : (
              <>
                {sending ? "Sendingâ€¦" : "Send message"} <Send />
              </>
            )}
          </button>
        </form>

        <div className="contact3-map-wrap">
          <div className="contact3-map">
            <iframe
              title="EMWA headquarters in Addis Ababa"
              src="https://www.openstreetmap.org/export/embed.html?bbox=38.74%2C9.00%2C38.78%2C9.03&layer=mapnik"
              loading="lazy"
            />
          </div>
          <div className="contact3-map-caption">
            <div>
              <p className="contact3-eyebrow">Our location</p>
              <strong>Kirkos, Addis Ababa</strong>
            </div>
            <a
              href="https://www.openstreetmap.org/?mlat=9.015&mlon=38.76#map=15/9.015/38.76"
              target="_blank"
              rel="noreferrer"
            >
              Directions <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>

      <section className="contact3-socials">
        <div>
          <p className="contact3-eyebrow">Follow our work</p>
          <h2>Stay connected.</h2>
        </div>
        <nav aria-label="Social media links">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              <Icon />
              <span>{label}</span>
              <ArrowUpRight />
            </a>
          ))}
        </nav>
      </section>

      {(sent || error) && (
        <div
          className="contact3-notice-backdrop"
          onMouseDown={() => {
            setSent(false);
            setError("");
          }}
        >
          <section
            className={`contact3-notice ${error ? "is-error" : "is-success"}`}
            role={error ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="contact-notice-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="contact3-notice-close"
              aria-label="Close message"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              <X />
            </button>
            <span className="contact3-notice-icon">{error ? <AlertCircle /> : <Check />}</span>
            <p className="contact3-eyebrow">{error ? "Message not sent" : "Message received"}</p>
            <h2 id="contact-notice-title">
              {error ? "Something went wrong." : "Thank you for reaching out."}
            </h2>
            <p>
              {error ||
                "Your message has been received successfully. The EMWA team will review it and contact you as soon as possible."}
            </p>
            <button
              type="button"
              className="contact3-notice-action"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              {error ? "Try again" : "Done"}
            </button>
          </section>
        </div>
      )}
    </PageShell>
  );
}
