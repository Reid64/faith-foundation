import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — FAITH Foundation",
  description:
    "Stories, updates, and insights from FAITH Foundation — news on the Bright Box Homes partnership, financial-literacy tips, and the families finding instruction and tenancy hope across Central Texas.",
};

const POSTS = [
  {
    slug: "bright-box-homes-partnership-milestone",
    title: "How One Home Purchase Keeps Two Families Housed",
    category: "Partnership",
    date: "June 2, 2026",
    author: "FAITH Foundation Team",
    readTime: "4 min read",
    excerpt:
      "Our partnership with Bright Box Homes turns every home purchase into a $2,500 gift that funds housing vouchers. Here is how that renewable cycle of generosity is changing lives across Central Texas.",
    body: [
      "When a family closes on a home through Bright Box Homes, something remarkable happens: a $2,500 donation flows to FAITH Foundation at no extra cost to the buyer. We convert that gift directly into housing vouchers for neighbors who are one missed paycheck away from losing their home. One purchase, two families lifted.",
      "Over the past several months we have watched this model prove itself again and again. A young couple buying their first home had no idea that their signature would, weeks later, help a single mother in Burnet make a security deposit she could not otherwise afford. That is the quiet power of a renewable funding source — it grows as our community grows.",
      "We believe transparency is part of stewardship, so we report where every voucher dollar lands. As Bright Box Homes expands, the pool of assistance expands with it, creating a steady, sustainable engine for tenancy hope that does not depend on any single grant or season of giving.",
    ],
  },
  {
    slug: "five-budgeting-habits-that-protect-your-housing",
    title: "Five Budgeting Habits That Protect Your Housing",
    category: "Financial Literacy",
    date: "May 18, 2026",
    author: "FAITH Foundation Team",
    readTime: "6 min read",
    excerpt:
      "Stable housing starts with a stable budget. Our financial-literacy coaches share five practical habits that help families stay current on rent and build a cushion against the unexpected.",
    body: [
      "In our financial-literacy program, we meet families who work hard yet still feel one surprise expense away from crisis. The good news is that a few durable habits can change that trajectory. The first is simple: pay your housing cost first, before any other discretionary spending, treating rent or mortgage as the non-negotiable foundation of the month.",
      "Second, build an emergency cushion — even $10 a week adds up to a buffer that can absorb a car repair without threatening the rent. Third, track every dollar for one month; nearly every family we coach discovers spending they did not realize was happening. Fourth, communicate early with a landlord if money is tight, because a proactive conversation almost always beats a missed payment.",
      "Finally, separate wants from needs honestly and revisit that line every season. None of these habits require a high income — they require a plan. That is exactly what our coaches help families build, one appointment at a time, so that a roof overhead becomes something families can keep, not just something they reach for.",
    ],
  },
  {
    slug: "faith-and-service-why-we-serve",
    title: "Faith in Action: Why We Refuse to Let a Neighbor Fall",
    category: "Mission",
    date: "April 29, 2026",
    author: "FAITH Foundation Team",
    readTime: "5 min read",
    excerpt:
      "FAITH stands for Faith, Accountability, Instruction, Tenacity, and Hope. Here is what those values look like in the everyday work of serving families across the Hill Country.",
    body: [
      "The name FAITH is not decoration — each letter names a value that guides how we serve. Faith is the conviction that no family is beyond hope. Accountability is the promise that every dollar entrusted to us is stewarded openly. Instruction is our belief that education opens doors that stay open. Tenacity is our refusal to give up when the work is hard. Hope is the heartbeat of all of it.",
      "Those words become real in ordinary moments: a coach sitting at a kitchen table to build a budget, a voucher arriving in time to stop an eviction, a volunteer driving a family to a housing appointment. We are a faith-based organization, but our doors and programs are open to everyone, without condition or preference.",
      "We share these stories not to celebrate ourselves but to invite you in. Every gift, every hour volunteered, and every prayer is part of a community that refuses to let a neighbor fall through the cracks. That is faith in action, and it is the reason we keep showing up.",
    ],
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            News &amp; Stories
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            The FAITH Foundation <span className="text-gold">blog</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Updates from our programs, practical tips from our financial-literacy
            coaches, and the stories of families finding instruction and tenancy
            hope across Central Texas. We share where the work is going and who it
            is reaching, because transparency is part of how we steward your
            trust.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="space-y-12">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/60">
                  <span className="font-bold uppercase tracking-widest text-gold-dark">
                    {post.category}
                  </span>
                  <span aria-hidden>•</span>
                  <span>{post.date}</span>
                  <span aria-hidden>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-foreground/60">
                  By {post.author}
                </p>
                <p className="mt-5 text-lg font-semibold leading-relaxed text-foreground/80">
                  {post.excerpt}
                </p>
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-foreground/80">
                  {post.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Want these stories in your inbox?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Reach out to join our community of supporters, or give today to help
            keep families learning and keep families housed.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
