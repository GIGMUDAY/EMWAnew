import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Check, Facebook, Instagram, Linkedin, Send, Youtube } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — EMWA" },
    { name: "description", content: "Contact the Ethiopian Media Women Association." },
    { property: "og:title", content: "Contact — EMWA" },
  ] }),
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

  return (
    <PageShell>
      <section className="contact3-hero">
        <p className="contact3-eyebrow">Contact / EMWA</p>
        <h1>Start a <em>conversation.</em></h1>
        <p>Have a question, an idea, or a reason to work together? Send us a message.</p>
      </section>

      <section className="contact3-main">
        <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <header><p className="contact3-eyebrow">Write to us</p><h2>Send a message.</h2></header>
          <div className="contact3-fields">
            <label><span>Your name</span><input name="name" autoComplete="name" placeholder="Full name" required /></label>
            <label><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label className="is-wide"><span>Subject</span><select name="subject" defaultValue=""><option value="" disabled>Select a subject</option><option>Membership</option><option>Partnership</option><option>Media enquiry</option><option>Programme collaboration</option><option>Other</option></select></label>
            <label className="is-wide"><span>Message</span><textarea name="message" rows={5} placeholder="How can we help?" required /></label>
          </div>
          <button type="submit" className={sent ? "is-sent" : ""}>{sent ? <><Check /> Message sent</> : <>Send message <Send /></>}</button>
        </form>

        <div className="contact3-map-wrap">
          <div className="contact3-map"><iframe title="EMWA headquarters in Addis Ababa" src="https://www.openstreetmap.org/export/embed.html?bbox=38.74%2C9.00%2C38.78%2C9.03&layer=mapnik" loading="lazy" /></div>
          <div className="contact3-map-caption"><div><p className="contact3-eyebrow">Our location</p><strong>Kirkos, Addis Ababa</strong></div><a href="https://www.openstreetmap.org/?mlat=9.015&mlon=38.76#map=15/9.015/38.76" target="_blank" rel="noreferrer">Directions <ArrowUpRight /></a></div>
        </div>
      </section>

      <section className="contact3-socials">
        <div><p className="contact3-eyebrow">Follow our work</p><h2>Stay connected.</h2></div>
        <nav aria-label="Social media links">{SOCIALS.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer"><Icon /><span>{label}</span><ArrowUpRight /></a>)}</nav>
      </section>
    </PageShell>
  );
}
