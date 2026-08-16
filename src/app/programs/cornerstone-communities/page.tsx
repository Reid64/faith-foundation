import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cornerstone Communities Program | FAITH Foundation',
  description:
    "FAITH Foundation builds purpose-built Cornerstone Communities on donated land — with on-site support, resource centers, and transitional housing in Texas.",
  alternates: { canonical: "/programs/cornerstone-communities" },
};

type CommunityFeature = {
  name: string;
  description: string;
};

type Community = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: CommunityFeature[];
  imageSrc: string;
  imageAlt: string;
};

const communities: Community[] = [
  {
    id: 'recovery-reentry',
    title: 'Recovery and Reentry Communities',
    subtitle: 'Purpose-Built for Second Chances',
    description:
      'Dedicated residential communities designed specifically for individuals in addiction recovery and those reentering society after incarceration. Every element, from the site layout to the daily programming, is built around giving residents the structure, support, and dignity they need to rebuild their lives.',
    features: [
      {
        name: 'Celebrate Recovery and Support Groups',
        description:
          'On-site faith-based and secular recovery programming with trained facilitators, peer mentors, and structured group sessions held multiple times per week.',
      },
      {
        name: 'Resource and Remote Work Center',
        description:
          'A combined learning center, coworking space, and community hub with high-speed internet, workstations, printers, and private rooms for remote employment, online education, and job interviews.',
      },
      {
        name: 'On-Site Laundry and Essential Services',
        description:
          'Community laundry facilities, mail services, and basic necessities, removing barriers so residents can focus on recovery, employment, and personal growth.',
      },
      {
        name: 'Shuttle Transportation',
        description:
          'Scheduled shuttle service connecting the community to nearby employers, grocery stores, medical facilities, and public transit hubs, solving the rural transportation gap that derails reentry success.',
      },
      {
        name: 'Case Management and Mentorship',
        description:
          'Dedicated case workers and volunteer mentors who help residents navigate employment, legal obligations, benefits, and the path toward independent homeownership.',
      },
      {
        name: 'Substance-Free Environment',
        description:
          'A clean and accountable community with clear standards, regular check-ins, and a peer culture that reinforces long-term sobriety and personal responsibility.',
      },
    ],
    imageSrc: '/Images/cornerstone-campus.jpg',
    imageAlt:
      'Rendering of a FAITH Foundation recovery and reentry Cornerstone Community campus',
  },
  {
    id: 'transitional-housing',
    title: 'Transitional Housing Communities',
    subtitle: 'Stability First, Homeownership Next',
    description:
      'Micro-apartment communities for individuals and families who need a stable bridge between crisis and permanent housing. Designed for short to medium-term stays with intensive support services that prepare residents for independent living and eventual homeownership through FAITH housing vouchers.',
    features: [
      {
        name: 'Furnished Micro-Apartments',
        description:
          'Compact, fully furnished private units with a kitchenette, bathroom, and sleeping area, providing immediate dignity and privacy from day one.',
      },
      {
        name: 'Employment and Skills Center',
        description:
          'On-site computer lab and coworking space with resume assistance, interview coaching, remote work opportunities, and connections to local employers actively hiring.',
      },
      {
        name: 'Community Support Programming',
        description:
          'Regularly scheduled support groups, budgeting classes, and life skills training led by qualified counselors and community volunteers.',
      },
      {
        name: 'Children and Family Services',
        description:
          'After-school homework help, childcare coordination, and family counseling for single-parent residents, because housing stability starts with the whole family.',
      },
      {
        name: 'Homeownership Pipeline',
        description:
          'Residents who demonstrate stability and complete the financial readiness program become eligible for FAITH Foundation housing vouchers, opening the path from temporary housing to permanent homeownership.',
      },
      {
        name: 'On-Site Case Management',
        description:
          'A dedicated team that meets with residents regularly to set goals, track progress, and remove the practical barriers that stand between a family and a permanent home.',
      },
    ],
    imageSrc: '/Images/new-beginnings.jpg',
    imageAlt:
      'Rendering of a FAITH Foundation transitional housing Cornerstone Community',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Land Acquisition',
    text: 'Donated or discounted parcels from landowners, churches, and municipalities become the foundation for a new community.',
  },
  {
    step: '02',
    title: 'Assessment and Planning',
    text: 'Environmental review, zoning compliance, and community design, all shaped around the real needs of future residents.',
  },
  {
    step: '03',
    title: 'Open-Bid Development',
    text: 'Construction contracts are awarded through competitive bidding, keeping the process transparent, fair, and high quality.',
  },
  {
    step: '04',
    title: 'Resident Placement',
    text: 'Qualified voucher recipients move in with wraparound support services in place from day one.',
  },
];

const landDonors = [
  {
    title: 'Landowners',
    text: 'Unused or underperforming land that could serve a greater purpose while providing a valuable tax deduction.',
  },
  {
    title: 'Churches',
    text: 'Surplus church property or undeveloped parcels owned by faith organizations that want to expand their mission.',
  },
  {
    title: 'Municipalities',
    text: 'Tax-delinquent lots, surplus government land, or parcels already designated for affordable housing.',
  },
  {
    title: 'Developers',
    text: 'Undevelopable remainder parcels, community benefit contributions, or donated lots from new subdivisions.',
  },
];

type RoadmapPhase = {
  phase: string;
  title: string;
  status: string;
  text: string;
  cta?: { label: string; href: string };
};

const roadmap: RoadmapPhase[] = [
  {
    phase: 'Phase 1',
    title: 'Land Acquisition',
    status: 'Active — Seeking Partners',
    text: 'Our first priority is securing land through donation, land bank transfer, or partnership with a willing landowner. We are actively pursuing donated parcels, municipal land bank opportunities, and private land gifts from donors who want their land to serve a lasting purpose. If you own land in Texas and want to put it to work for families, we want to hear from you.',
    cta: { label: 'Contact us about land donation', href: '/contact' },
  },
  {
    phase: 'Phase 2',
    title: 'Site Development',
    status: 'Seeking In-Kind Partners',
    text: 'Once land is secured, we need civil engineers, septic contractors, water utility providers, and electrical contractors to develop the infrastructure that makes a home livable. We are actively seeking licensed professionals and construction companies willing to donate or discount their services as part of our mission. Every site development contribution is tax-deductible and publicly acknowledged.',
    cta: { label: 'Contact us about service donations', href: '/contact' },
  },
  {
    phase: 'Phase 3',
    title: 'First Home Placement',
    status: 'Our Near-Term Goal',
    text: 'Our initial target is the placement of one modular home on donated or acquired land — fully permitted, properly connected, and documented transparently from groundbreaking to move-in. This first home will serve as proof of concept for the Cornerstone Communities model and the foundation for everything that follows. A corporate construction partner is positioned to provide the first home through a modular construction program, with full documentation from groundbreaking to move-in.',
  },
  {
    phase: 'Phase 4',
    title: 'Replication and Growth',
    status: 'The Vision',
    text: 'With one home proven, the model becomes repeatable. Additional land donations, service partnerships, and construction sponsors expand the community one home at a time — each placement documented, each family vetted, each donor acknowledged. This is how FAITH Foundation builds Cornerstone Communities: slowly, honestly, and with full accountability to the people whose generosity makes it possible.',
  },
];

type GalleryImage = {
  src: string;
  caption: string;
};

const microHouseGallery: GalleryImage[] = [
  {
    src: '/Images/micro-houses/micro-house-1.jpg',
    caption:
      'Factory-built and placed on site — these expandable container homes arrive move-in ready with a full kitchen, full bath, and climate control already installed.',
  },
  {
    src: '/Images/micro-houses/micro-house-2.jpg',
    caption:
      'Fully customizable interiors — residents choose flooring, finishes, and layout options that make the space genuinely their own.',
  },
  {
    src: '/Images/micro-houses/micro-house-3.jpg',
    caption:
      'Expandable shipping container construction means the home can grow with the family — additional modules attach as needs change.',
  },
  {
    src: '/Images/micro-houses/micro-house-4.jpg',
    caption:
      'Multiple exterior color options and modular configurations so every home reflects the family living in it, not a one-size-fits-all solution.',
  },
];

const microApartmentGallery: GalleryImage[] = [
  {
    src: '/Images/micro-apartments/micro-apartment-1.jpg',
    caption:
      'Compact and fully furnished — each micro-apartment includes a private kitchenette, full bath, sleeping area, and air conditioning from day one.',
  },
  {
    src: '/Images/micro-apartments/micro-apartment-2.jpg',
    caption:
      'Purpose-built for dignity — residents have a private, secure space that is theirs alone while they build toward permanent homeownership.',
  },
  {
    src: '/Images/micro-apartments/micro-apartment-3.jpg',
    caption:
      'Modular assembly construction keeps build costs low without sacrificing quality — so donor dollars reach more families faster.',
  },
  {
    src: '/Images/micro-apartments/micro-apartment-4.jpg',
    caption:
      'Community-centered design places support services, employment resources, and case management steps from every front door.',
  },
];

export default function CornerstoneCommunitiesPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF5]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8A951] font-semibold tracking-widest uppercase text-sm mb-4">
            Cornerstone Communities
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Building Cornerstones,{' '}
            <span className="text-[#C8A951]">Not Just Houses</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Housing vouchers help families buy homes, but what happens when there
            are no affordable homes to buy? Cornerstone Communities is our plan to
            address both sides of that equation — purpose-built communities on
            donated land, creating the affordable housing inventory that voucher
            recipients need.
          </p>
          {/* The roadmap section further down states plainly that no Cornerstone
              Community is operating yet. That disclosure belongs at the top of
              the page too, not only after a reader has scrolled past several
              screens of present-tense description. */}
          <p className="mt-6 inline-flex items-center rounded-full border border-[#C8A951]/50 bg-[#C8A951]/10 px-5 py-2 text-sm font-semibold text-[#E2C45C]">
            Planned program — no Cornerstone Community is operating yet. See the
            development roadmap below.
          </p>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Problem and Solution with How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-underline text-3xl font-bold text-[#1B2A4A] mb-6">
                The Missing Piece in Affordable Housing
              </h2>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                Most housing nonprofits focus on one thing: helping people afford a
                home. But in markets across the country, affordable housing
                inventory simply does not exist. Vouchers alone cannot solve a
                supply problem.
              </p>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                FAITH Foundation takes a different approach. We acquire donated land
                from private owners, churches, municipalities, and developers, then
                develop that land into Cornerstone Communities purpose-built for the
                people we serve.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Every development goes through a competitive open-bid process,
                ensuring transparency, fair pricing, and the highest quality
                construction for our residents.
              </p>
            </div>
            <div className="card-surface p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-6 text-center">
                How It Works
              </h3>
              <div className="space-y-6">
                {howItWorks.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#1B2A4A] text-[#C8A951] rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2A4A]">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Community Types */}
      {communities.map((community, idx) => (
        <Fragment key={community.id}>
          {idx > 0 && (
            <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
          )}
        <section
          id={community.id}
          className={
            idx % 2 === 0
              ? 'py-20 px-4 bg-gradient-to-b from-white to-[#f0ede4]'
              : 'py-20 px-4 bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]'
          }
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#C8A951] font-semibold tracking-widest uppercase text-sm mb-2">
                {community.subtitle}
              </p>
              <h2 className="heading-underline-center text-3xl md:text-4xl font-bold text-[#1B2A4A]">
                {community.title}
              </h2>
            </div>

            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg relative aspect-[21/9]">
              <img
                src={community.imageSrc}
                alt={community.imageAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <p className="text-gray-700 text-lg max-w-4xl mx-auto text-center mb-12 leading-relaxed">
              {community.description}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {community.features.map((feature, i) => (
                <div
                  key={feature.name}
                  className={`${i % 2 === 0 ? "card-feature-cream" : "card-feature-white"} p-6 rounded-xl transition-shadow`}
                >
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </Fragment>
      ))}

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Housing That Makes It Possible — micro house + micro apartment gallery */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f0ede4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#C8A951] font-semibold tracking-widest uppercase text-sm mb-2">
              The Housing Behind the Vision
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A]">
              Housing That Makes It Possible
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
              Cornerstone Communities are built from factory-finished, expandable
              container homes and transitional micro-apartments, so donor dollars
              go further and families reach stable housing faster.
            </p>
          </div>

          {/* Container homes */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-[#1B2A4A] mb-6">
              Container Homes
            </h3>
            <p className="text-gray-700 text-lg max-w-4xl mb-8 leading-relaxed">
              These are expandable shipping container homes and modular assembly
              units built off-site in a factory and placed on donated land ready to
              occupy. Every home comes fully equipped — full kitchen, full
              bathroom, and air conditioning included — and is fully customizable
              with multiple exterior colors, interior flooring options, and layout
              configurations. Factory construction and efficient design make these
              homes dramatically more affordable than traditional stick-built
              construction, putting permanent homeownership within reach for
              families who thought it was impossible.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {microHouseGallery.map((image) => (
                <figure
                  key={image.src}
                  className="card-feature-white flex flex-col overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1B2A4A]">
                    <img
                      src={image.src}
                      alt={image.caption}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="flex-1 border-t-2 border-[#C8A951] p-4 text-sm leading-relaxed text-gray-700">
                    {image.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Transitional micro-apartments */}
          <div>
            <h3 className="text-2xl font-bold text-[#1B2A4A] mb-6">
              Transitional Micro-Apartments
            </h3>
            <p className="text-gray-700 text-lg max-w-4xl mb-8 leading-relaxed">
              These purpose-built micro-apartments provide fully furnished private
              units — complete with kitchenette, full bathroom, and air
              conditioning — designed for short to medium-term stays while
              residents stabilize, save, and prepare for permanent homeownership.
              Modular construction keeps costs low so more neighbors can be served
              without compromising on the dignity and privacy every person
              deserves.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {microApartmentGallery.map((image) => (
                <figure
                  key={image.src}
                  className="card-feature-white flex flex-col overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1B2A4A]">
                    <img
                      src={image.src}
                      alt={image.caption}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="flex-1 border-t-2 border-[#C8A951] p-4 text-sm leading-relaxed text-gray-700">
                    {image.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Who Can Donate Land */}
      <section className="py-20 px-4 bg-[#1B2A4A] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="heading-underline-center text-3xl md:text-4xl font-bold text-center mb-4">
            Who Can <span className="text-[#C8A951]">Donate Land</span>?
          </h2>
          <p className="text-gray-300 text-center text-lg mb-12 max-w-3xl mx-auto">
            Land donations to FAITH Foundation are tax-deductible. We accept
            parcels of all sizes, from a single lot to multi-acre tracts, in any
            state.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {landDonors.map((donor) => (
              <div
                key={donor.title}
                className="card-on-navy p-6 rounded-xl text-center"
              >
                <h3 className="text-lg font-bold text-[#C8A951] mb-2">
                  {donor.title}
                </h3>
                <p className="text-gray-300 text-sm">{donor.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Land Inquiry */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f0ede4]" id="land-inquiry">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-underline-center text-3xl font-bold text-[#1B2A4A] mb-4">
            Inquire About a Land Donation
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Have land you would like to donate or discuss? Contact our team directly and we will respond within 48 hours to talk through the opportunity, answer questions about the tax benefits of land donations to a 501(c)(3), and conduct a preliminary assessment.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#C8A951] text-[#1B2A4A] font-bold px-10 py-4 rounded-lg hover:bg-[#b8993f] transition-colors text-lg shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
          >
            Contact Us About Land Donation
          </Link>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* Development Roadmap */}
      <section className="py-20 px-4 bg-[#FAFAF5]" id="roadmap">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C8A951] font-semibold tracking-widest uppercase text-sm mb-2">
              Transparency in Action
            </p>
            <h2 className="heading-underline-center text-3xl md:text-4xl font-bold text-[#1B2A4A]">
              How We&apos;re Building This — Phase by Phase
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
              FAITH Foundation is a young organization with an honest vision. We
              are not yet operating a Cornerstone Community — but we are building
              toward one with intention, transparency, and the support of donors
              and land partners who believe in what this model can become. Here is
              exactly where we are and where we are going.
            </p>
          </div>

          <ol className="grid gap-6 md:grid-cols-2">
            {roadmap.map((item, i) => (
              <li
                key={item.phase}
                className={`${i % 2 === 0 ? 'card-feature-cream' : 'card-feature-white'} flex flex-col rounded-2xl p-8`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#1B2A4A] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#C8A951]">
                    {item.phase}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#C8A951] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#8a7226]">
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-[#1B2A4A]">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-gray-700">
                  {item.text}
                </p>
                {item.cta && (
                  <Link
                    href={item.cta.href}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#1B2A4A] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#243558]"
                  >
                    {item.cta.label}
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-2xl border-l-[5px] border-[#C8A951] bg-white px-7 py-6 shadow-lg">
            <p className="leading-relaxed text-[#1B2A4A]">
              Every dollar designated to Cornerstone Communities goes directly
              toward land acquisition, site development, or home placement — not
              administration. If you want to give toward a specific phase, contact
              us and we will designate your gift accordingly.
            </p>
            {/* The live tracker reports the same four phases with real dates.
                This page is the narrative; that page is the current state. They
                must never disagree — see the note in src/app/cornerstone/page.tsx. */}
            <p className="mt-4 leading-relaxed text-[#1B2A4A]">
              <Link
                href="/cornerstone"
                className="font-bold underline underline-offset-4"
              >
                Track our progress phase by phase
              </Link>{" "}
              — updated as each milestone is actually reached, not when it is
              planned.
            </p>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* CTA Banner */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">
            Not a landowner? You can still help build communities.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-block bg-[#C8A951] text-[#1B2A4A] font-bold px-8 py-4 rounded-lg hover:bg-[#b8993f] transition-colors text-lg shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
            >
              Donate to Housing Vouchers
            </Link>
            <Link
              href="/volunteer"
              className="inline-block bg-[#1B2A4A] text-white font-bold px-8 py-4 rounded-lg hover:bg-[#243558] transition-colors text-lg"
            >
              Volunteer Your Time
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
