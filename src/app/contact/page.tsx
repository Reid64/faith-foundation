import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — FAITH Foundation",
  description:
    "Get in touch with FAITH Foundation at 209 Surecast Drive, Suite 105, Burnet, TX 78611, or call 888-497-6620. Reach our team about housing assistance, donations, volunteering, or partnership.",
};

const MAP_QUERY = encodeURIComponent(
  "209 Surecast Drive Suite 105 Burnet TX 78611"
);

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            We&apos;d Love to Hear From You
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Get in <span className="text-gold">touch</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Whether you need housing assistance, want to make a gift, hope to
            volunteer, or simply have a question, the FAITH Foundation team is
            here for you. Reach out and a real person will respond — no phone
            trees, no run-around.
          </p>
        </div>
      </section>

      {/* Contact details + form */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Reach Our Team
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy">
              Here to help, every step of the way
            </h3>
            <p className="mb-8 text-lg leading-relaxed text-foreground/80">
              FAITH Foundation is a 501(c)(3) nonprofit serving Burnet and the
              surrounding Central Texas Hill Country. Our office is open to
              neighbors, donors, and partners alike. If you are facing a housing
              crisis, do not wait — contact us today and we will walk with you
              through your options. For all other questions, use the form and we
              will reply as quickly as we can.
            </p>

            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                  Address
                </dt>
                <dd className="mt-1">
                  <address className="not-italic leading-relaxed text-foreground/80">
                    209 Surecast Drive, Suite 105
                    <br />
                    Burnet, TX 78611
                  </address>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                  Phone
                </dt>
                <dd className="mt-1">
                  <a
                    href="tel:+18884976620"
                    className="text-lg font-semibold text-navy hover:text-gold-dark"
                  >
                    888-497-6620
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href="mailto:info@faithfoundationsf.org"
                    className="text-lg font-semibold text-navy hover:text-gold-dark"
                  >
                    info@faithfoundationsf.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                  Office Hours
                </dt>
                <dd className="mt-1 leading-relaxed text-foreground/80">
                  Monday – Friday, 9:00 AM – 5:00 PM (Central). Evenings and
                  weekends by appointment.
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Send a Message
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy">
              Tell us how we can serve you
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Find Us
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Visit our Burnet office
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              We are conveniently located in Burnet, Texas, at the heart of the
              communities we serve. Stop by during office hours, or call ahead to
              schedule a time to meet with a member of our team.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border-4 border-gold shadow-lg">
            <iframe
              title="Map showing FAITH Foundation at 209 Surecast Drive, Suite 105, Burnet, TX 78611"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
