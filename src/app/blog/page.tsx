import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Blog — FAITH Foundation",
  description:
    "Stories and updates from FAITH Foundation on how community donations fund down payment assistance and help Texas families reach homeownership.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  {
    slug: "how-housing-vouchers-work",
    title: "How Down Payment Assistance Vouchers Open the Door to Ownership",
    category: "Programs",
    date: "June 2, 2026",
    author: "FAITH Foundation Team",
    readTime: "4 min read",
    excerpt:
      "A down payment is the single biggest barrier standing between a hardworking family and a home of their own. Here is how our assistance vouchers, made possible by the generosity of donors and community partners, help families cross that threshold across Texas.",
    body: [
      "Many families can comfortably afford a monthly mortgage yet can never save the lump sum needed to close. A down payment assistance voucher is designed to close that gap directly, turning a qualified renter into a homeowner. Vouchers are funded by individual and corporate donations designated for down payment assistance, and paired with referrals to HUD-approved homeownership counseling so families buy with confidence.",
      "As a newly established organization, we are building this model with care. Our aim is for community generosity to help families in Texas cover the down payment that makes homeownership possible. That is the quiet power of pooled giving — it grows as the community giving into it grows.",
      "We believe transparency is part of stewardship, so we have committed to reporting where voucher dollars land in our first annual impact summary. As our base of donors and partners grows, the pool of down payment assistance is designed to expand with it — a sustainable engine for homeownership that does not depend on any single grant or season of giving.",
    ],
  },
  {
    slug: "five-budgeting-habits-that-protect-your-housing",
    title: "Five Budgeting Habits That Protect Your Housing",
    category: "Homeownership",
    date: "May 18, 2026",
    author: "FAITH Foundation Team",
    readTime: "6 min read",
    excerpt:
      "Stable housing starts with a stable budget. Five practical habits that help households stay current on housing costs and build a cushion against the unexpected — the groundwork that makes a family mortgage-ready.",
    body: [
      "Plenty of households work hard and still feel one surprise expense away from crisis. The good news is that a few durable habits can change that trajectory, and none of them depend on earning more. The first is simple: pay your housing cost first, before any other discretionary spending, treating rent or mortgage as the non-negotiable foundation of the month.",
      "Second, build an emergency cushion — even $10 a week adds up to a buffer that can absorb a car repair without threatening the rent. Third, track your spending for one full month; households that do this routinely find outflows they did not realize were happening. Fourth, communicate early with a landlord if money is tight, because a proactive conversation almost always beats a missed payment.",
      "Finally, separate wants from needs honestly and revisit that line every season. None of these habits require a high income — they require a plan. FAITH Foundation refers families to HUD-approved homeownership counseling partners for individualized guidance; we do not provide financial counseling ourselves. This article is general educational information, not financial advice.",
    ],
  },
  {
    slug: "what-faith-stands-for",
    title: "What FAITH Stands For: A Foundation for Homeownership",
    category: "Mission",
    date: "April 29, 2026",
    author: "FAITH Foundation Team",
    readTime: "5 min read",
    excerpt:
      "FAITH stands for \"Foundation for Affordable Instruction and Tenancy Hope\" — five words that describe how we help families reach homeownership through down payment assistance across Texas.",
    body: [
      "The name FAITH is not decoration — it spells out our mission. FAITH stands for \"Foundation for Affordable Instruction and Tenancy Hope.\" F is the Foundation we lay beneath a family's future. A is the Affordable path to owning a home, made real through down payment assistance. I is the Instruction that prepares families to buy and to keep what they earn. T is the Tenancy and ownership we help families secure. And H is the Hope of a permanent place to call their own.",
      "Those words are meant to become real in ordinary moments: a counselor reviewing a mortgage-ready budget at a kitchen table, a down payment voucher arriving in time to close on a first home, a volunteer walking a family through the keys-in-hand finish line. That is the work we are built to do. We are a faith-based organization, but our doors and programs are open to everyone, without condition or preference.",
      "We describe this not to celebrate ourselves — we are new, and our results are still ahead of us — but to invite you in. Every gift, every hour volunteered, and every prayer is part of a community that helps a neighbor become a homeowner. That is what FAITH stands for, and it is the reason we keep showing up.",
    ],
  },
];

// Rotate image keys across the magazine grid.
const POST_IMAGES = ["newKeys", "finance", "communityGathering"] as const;

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <>
      {/* ===== HERO — dark photo + navy overlay ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("studying", 1900, 1100)}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              News &amp; Stories
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              The FAITH Foundation <span className="text-gold">blog</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Updates from our programs, how community donations fund our work,
              and the stories of families reaching homeownership through down payment
              assistance across Texas. We share where the work is going and who it
              is reaching, because transparency is part of how we steward your
              trust.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== FEATURED POST — large wide card, image on top ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Featured story
            </span>
          </Reveal>
          <Reveal delay={100}>
            <article className="card-surface group mt-6 overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[21/9] w-full overflow-hidden">
                <img
                  src={img(POST_IMAGES[0], 1700, 740)}
                  alt={featured.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-navy shadow-card">
                  {featured.category}
                </span>
              </div>
              <div className="p-8 sm:p-12">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-charcoal/60">
                  <span>{featured.date}</span>
                  <span aria-hidden>•</span>
                  <span>{featured.readTime}</span>
                  <span aria-hidden>•</span>
                  <span>By {featured.author}</span>
                </div>
                <h2 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-5 text-xl font-semibold leading-relaxed text-charcoal/80">
                  {featured.excerpt}
                </p>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-charcoal/80">
                  {featured.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== MAGAZINE GRID — remaining posts ===== */}
      <section className="bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal>
            <h2 className="heading-underline text-3xl font-extrabold text-navy sm:text-4xl">
              More from the blog
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={i * 100}>
                <article className="card-surface group flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-shadow duration-300">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={img(POST_IMAGES[(i + 1) % POST_IMAGES.length], 900, 560)}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-green px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-charcoal/60">
                      <span>{post.date}</span>
                      <span aria-hidden>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="mt-3 text-2xl font-extrabold text-navy">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-charcoal/60">
                      By {post.author}
                    </p>
                    <p className="mt-4 text-lg font-semibold leading-relaxed text-charcoal/80">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 space-y-4 text-base leading-relaxed text-charcoal/75">
                      {post.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== CTA — newsletter nudge ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Want these stories in your inbox?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Reach out to join our community of supporters, or give today to help
              another family reach the milestone of homeownership.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                Donate Now
              </Link>
              <Link
                href="/contact"
                className="rounded-md border-2 border-green px-8 py-3 text-base font-bold text-green-light transition-colors hover:bg-green hover:text-white"
              >
                Get in Touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


