import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EMWA" },
      { name: "description", content: "Contact the Ethiopian Media Women Association. Office locations, phone, email, and inquiry form." },
      { property: "og:title", content: "Contact — EMWA" },
      { property: "og:description", content: "Reach EMWA's Addis Ababa headquarters and regional chapters." },
    ],
  }),
  component: Contact,
});

const OFFICES = [
  { city: "Addis Ababa", role: "Headquarters", addr: "Kirkos Sub-city, Woreda 08", tel: "+251 11 550 0000" },
  { city: "Bahir Dar", role: "Amhara Chapter", addr: "Bahir Dar University District", tel: "+251 58 220 0000" },
  { city: "Hawassa", role: "Sidama Chapter", addr: "Piassa Street, Hawassa", tel: "+251 46 220 0000" },
  { city: "Mekelle", role: "Tigray Chapter", addr: "Ayder, Mekelle", tel: "+251 34 440 0000" },
];

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title={<>Say <span className="text-primary">hello.</span></>}
        lede="For membership, partnership, media enquiries, or programme collaboration — reach the team that fits your question."
      />

      {/* Quick contact */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { i: Mail, l: "Email", v: "info@emwa.org.et", h: "mailto:info@emwa.org.et" },
            { i: Phone, l: "Phone", v: "+251 11 550 0000", h: "tel:+251115500000" },
            { i: MapPin, l: "Headquarters", v: "Addis Ababa, ET", h: "#map" },
            { i: Clock, l: "Hours", v: "Mon–Fri · 09:00–17:00" },
          ].map(({ i: Icon, l, v, h }) => (
            <a
              key={l}
              href={h || "#"}
              className="border border-border p-8 hover:border-foreground transition-colors block"
            >
              <Icon className="size-6 text-primary mb-4" />
              <p className="label-mono text-muted-foreground mb-1">{l}</p>
              <p className="font-display text-2xl">{v}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Form + map */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-16">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="space-y-6"
          >
            <p className="label-mono text-primary">Enquiry Form</p>
            <h2 className="font-display text-5xl">Get in touch.</h2>

            <div>
              <label className="label-mono block mb-2">Your name</label>
              <input required className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="label-mono block mb-2">Email</label>
              <input type="email" required className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="label-mono block mb-2">Subject</label>
              <select className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary">
                <option>Membership</option>
                <option>Partnership</option>
                <option>Media enquiry</option>
                <option>Programme collaboration</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label-mono block mb-2">Message</label>
              <textarea required rows={5} className="w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-primary resize-none" />
            </div>

            <button
              type="submit"
              className="bg-foreground text-background px-8 py-4 label-mono hover:bg-primary transition-colors"
            >
              {sent ? "Message sent ✓" : "Send message →"}
            </button>
          </form>

          <div id="map">
            <p className="label-mono text-primary mb-4">Headquarters</p>
            <h3 className="font-display text-4xl mb-6">Kirkos, Addis Ababa</h3>
            <div className="aspect-[4/3] overflow-hidden border border-border">
              <iframe
                title="EMWA location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=38.74%2C9.00%2C38.78%2C9.03&layer=mapnik"
                className="w-full h-full grayscale"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Visitor entrance on the ground floor. Please register at
              reception. Wheelchair accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-24 bg-muted/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Regional Chapters</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">Twelve offices. One association.</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {OFFICES.map(o => (
              <div key={o.city} className="border border-border bg-background p-8">
                <p className="label-mono text-primary mb-3">{o.role}</p>
                <p className="font-display text-3xl mb-3">{o.city}</p>
                <p className="text-sm text-muted-foreground mb-2">{o.addr}</p>
                <a href={`tel:${o.tel.replace(/\s/g, "")}`} className="label-mono hover:text-primary">{o.tel}</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
