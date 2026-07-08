import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cornerstone Communities Program | FAITH Foundation',
  description:
    'FAITH Foundation develops purpose-built Cornerstone Communities on donated land, with on-site support services, resource centers, and transitional housing that help residents reach stability and homeownership.',
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
          'Regularly scheduled support groups, financial literacy workshops, budgeting classes, and life skills training led by qualified counselors and community volunteers.',
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
            are no affordable homes to buy? FAITH Foundation solves both sides of
            the equation by developing purpose-built Cornerstone Communities on
            donated land, creating the housing inventory our voucher recipients
            need.
          </p>
        </div>
      </section>

      {/* Problem and Solution with How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1B2A4A] mb-6">
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
            <div className="bg-white p-8 rounded-2xl shadow-lg">
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

      {/* Community Types */}
      {communities.map((community, idx) => (
        <section
          key={community.id}
          id={community.id}
          className={
            idx % 2 === 0 ? 'py-20 px-4 bg-white' : 'py-20 px-4 bg-[#FAFAF5]'
          }
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#C8A951] font-semibold tracking-widest uppercase text-sm mb-2">
                {community.subtitle}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A]">
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
              {community.features.map((feature) => (
                <div
                  key={feature.name}
                  className="bg-[#FAFAF5] border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow"
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
      ))}

      {/* Who Can Donate Land */}
      <section className="py-20 px-4 bg-[#1B2A4A] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
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
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center"
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

      {/* Land Inquiry Form */}
      <section className="py-20 px-4 bg-white" id="land-inquiry">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">
              Inquire About a Land Donation
            </h2>
            <p className="text-gray-600 text-lg">
              Have land you would like to donate or discuss? Fill out the form
              below and our team will contact you within 48 hours to talk through
              the opportunity.
            </p>
          </div>

          <LandInquiryForm />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 bg-[#FAFAF5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">
            Not a landowner? You can still help build communities.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-block bg-[#C8A951] text-[#1B2A4A] font-bold px-8 py-4 rounded-lg hover:bg-[#b8993f] transition-colors text-lg"
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

function LandInquiryForm() {
  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#C8A951] focus:ring-2 focus:ring-[#C8A951]/20 outline-none transition-colors';
  const labelClass = 'block text-sm font-semibold text-[#1B2A4A] mb-1';

  return (
    <div className="bg-[#FAFAF5] rounded-2xl shadow-lg p-8">
      <form action="https://formspree.io/f/YOUR_FORMSPREE_LAND_ID" method="POST">
        <input type="hidden" name="_subject" value="New Land Donation Inquiry" />

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="land-name" className={labelClass}>
              Your Name *
            </label>
            <input
              type="text"
              id="land-name"
              name="name"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="land-org" className={labelClass}>
              Organization (if applicable)
            </label>
            <input
              type="text"
              id="land-org"
              name="organization"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="land-email" className={labelClass}>
              Email *
            </label>
            <input
              type="email"
              id="land-email"
              name="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="land-phone" className={labelClass}>
              Phone
            </label>
            <input
              type="tel"
              id="land-phone"
              name="phone"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="land-type" className={labelClass}>
            I am a... *
          </label>
          <select
            id="land-type"
            name="donor_type"
            required
            className={inputClass}
          >
            <option value="">Select one...</option>
            <option value="landowner">Landowner</option>
            <option value="church">Church or Faith Organization</option>
            <option value="municipality">Municipality or County Government</option>
            <option value="developer">Developer or Builder</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="land-location" className={labelClass}>
              Property Location (City, State) *
            </label>
            <input
              type="text"
              id="land-location"
              name="property_location"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="land-acreage" className={labelClass}>
              Approximate Acreage
            </label>
            <input
              type="text"
              id="land-acreage"
              name="acreage"
              placeholder="e.g., 2.5 acres"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="land-zoning" className={labelClass}>
            Current Zoning (if known)
          </label>
          <input
            type="text"
            id="land-zoning"
            name="zoning"
            placeholder="e.g., Residential, Agricultural, Mixed-Use"
            className={inputClass}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="land-details" className={labelClass}>
            Tell us about the property and your interest in donating *
          </label>
          <textarea
            id="land-details"
            name="details"
            rows={5}
            required
            className={inputClass}
            placeholder="Describe the property, its current condition, access to utilities, and what motivated you to consider donating."
          />
        </div>

        <div className="bg-white p-4 rounded-lg mb-6 text-sm text-gray-600">
          Submitting this form does not constitute a binding commitment to donate.
          Our team will contact you to discuss the opportunity, conduct a
          preliminary assessment, and answer any questions about the tax benefits
          of land donations to a 501(c)(3) organization.
        </div>

        <button
          type="submit"
          className="w-full bg-[#C8A951] text-[#1B2A4A] font-bold text-lg py-4 rounded-lg hover:bg-[#b8993f] transition-colors"
        >
          Submit Land Inquiry
        </button>
      </form>
    </div>
  );
}
