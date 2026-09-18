/**
 * THE BOARD ROSTER — the single source of truth for who FAITH Foundation
 * publishes as a director or officer.
 *
 * Before 2026-09-18 this roster was copy-pasted into three page files:
 * `/team`, `/about` and `/governance`. Removing a departing officer therefore
 * meant finding three arrays, and missing one would have left their name live
 * on a page nobody thought to check. It is defined once here and projected
 * into each surface, so adding or removing a director is one edit in one file.
 *
 * Each page renders a different slice of the same record:
 *
 *   /governance  name + governanceRole          (short title, three-up cards)
 *   /about       name + role + photo + shortBio (avatar strip)
 *   /team        every field                    (full directory cards)
 *
 * `role` and `governanceRole` differ deliberately — the governance page has
 * always published the short statutory title ("Secretary") while the team and
 * about pages publish the fuller working title ("Secretary & Protector"). That
 * distinction predates this file and is preserved, not invented here.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * NOTHING IN THIS FILE MAY IMPLY A VACANCY ON A PUBLIC PAGE.
 *
 * `BOARD` below is filtered to entries that carry a real name. An entry with
 * an empty `name` — a half-finished appointment, a placeholder somebody meant
 * to come back to — renders nowhere. That filter is the safety net behind the
 * commented-out vacancy entry: even if it were uncommented and left blank, no
 * empty card, no "Position Open" text and no gap can reach the public site.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type BoardMember = {
  /** Published name. An entry with an empty name is never rendered. */
  name: string;
  /** Title on /team and /about — the fuller working title. */
  role: string;
  /** Title on /governance — the short statutory title. */
  governanceRole: string;
  /** Two-letter monogram, used where a photo has not loaded. */
  initials: string;
  /** Portrait under /public/Images/team/. */
  photo: string;
  /** One sentence for the /about leadership strip. */
  shortBio: string;
  /** Full biography paragraphs for the /team directory card. */
  bio: string[];
};

/**
 * The roster as published. Order here is the order every page renders.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * VACANT OFFICE — PRESIDENT AND EXECUTIVE DIRECTOR
 *
 * The office of President and Executive Director is VACANT as of 2026-09-18,
 * following a resignation. It is deliberately absent from this array rather
 * than present-and-empty, so that no public page renders a card, a gap, a
 * placeholder portrait, or any structured-data or metadata hint that the
 * office is unfilled. The vacancy is invisible to the public by design.
 *
 * TO APPOINT A SUCCESSOR — in this order:
 *
 *   1. THE BOARD MUST RESOLVE FIRST. A board resolution electing the officer
 *      must be adopted and minuted before this file changes. The site follows
 *      the minute book; it does not lead it. A draft resolution accepting the
 *      resignation and declaring the office vacant is at
 *      `governance/resolutions/DRAFT-2026-09-18-president-vacancy.md` — a
 *      second resolution electing the successor is what authorises the edit
 *      below.
 *   2. Uncomment the block that follows and replace every ALL-CAPS placeholder
 *      with the real values. Every field in `BoardMember` must be filled; an
 *      entry left with an empty `name` is filtered out and will silently not
 *      appear, which is the intended failure mode.
 *   3. Add the portrait to `public/Images/team/` and point `photo` at it.
 *   4. Decide where in the array the entry belongs — the President has
 *      historically been listed first.
 *   5. `pnpm tsc --noEmit`, `pnpm run build`, and run
 *      `scripts/public-surface.spec.ts`. The vacancy-language assertions there
 *      must still pass: a real appointee introduces a name, never the words
 *      "vacant", "position open", "TBD" or "coming soon".
 *
 * NOTHING ELSE NEEDS TO CHANGE. /team, /about and /governance all read this
 * array.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const ROSTER: BoardMember[] = [
  // {
  //   name: "FULL NAME AS IT SHOULD BE PUBLISHED",
  //   role: "President & Executive Director",
  //   governanceRole: "President & Executive Director",
  //   initials: "XX",
  //   photo: "/Images/team/FILE-NAME.jpg",
  //   shortBio:
  //     "ONE SENTENCE FOR THE /about LEADERSHIP STRIP.",
  //   bio: [
  //     "FIRST BIOGRAPHY PARAGRAPH FOR THE /team DIRECTORY CARD.",
  //     "ADD AS MANY FURTHER PARAGRAPHS AS THE BIOGRAPHY NEEDS.",
  //   ],
  // },
  {
    name: "Pastor Juan Valdez",
    role: "Secretary & Protector",
    governanceRole: "Secretary",
    initials: "JV",
    photo: "/Images/team/pastor-juan-valdez.jpg",
    shortBio:
      "With nearly 30 years of ordained ministry across the Americas and beyond, Pastor Valdez provides the Foundation's spiritual oversight, governance accountability, and mission stewardship.",
    bio: [
      "Pastor Juan Valdez serves as Secretary and Protector of the Faith Foundation, providing spiritual oversight, governance accountability, and mission stewardship for the organization. With more than 40 years of Christian faith and nearly 30 years of ordained ministry experience, Pastor Valdez offers a lifetime of leadership grounded in biblical principles, service, and integrity.",
      "His ministry has extended across the United States, South America, Central America, the Caribbean, and Africa, where he has taught, preached, and supported faith-based outreach initiatives. Known for his wisdom, humility, and commitment to discipleship, Pastor Valdez has dedicated his life to helping individuals and families discover hope, purpose, and restoration through faith.",
      "Beyond ministry, Pastor Valdez and his wife, Martha, demonstrated an extraordinary commitment to their community through business ownership, operating a successful hair studio in the same San Antonio location for 34 years. Such longevity reflects the consistency, reliability, and stewardship that have characterized both his professional and ministry endeavors throughout his life.",
      "Pastor Valdez currently serves as an Associate Pastor at Temple of Praise and resides in Texas with his wife, Martha. Together they have built a legacy of faith that spans generations, including three daughters, six grandchildren, and two great-grandchildren.",
    ],
  },
  {
    name: "Scott Ellis",
    role: "Treasurer & Board Chair",
    governanceRole: "Treasurer / Board Chair",
    initials: "SE",
    photo: "/Images/team/scott-ellis.jpg",
    shortBio:
      "Owner of E4 Roofing and Construction for more than 15 years, Scott brings the financial oversight and construction expertise that strengthen the Foundation's affordable-housing work.",
    bio: [
      "Scott Ellis serves as Treasurer and Board Chair of the Faith Foundation, providing financial oversight, strategic guidance, and leadership in support of the Foundation's mission to expand affordable housing opportunities and strengthen communities through faith-based service.",
      "Scott is the owner of E4 Roofing and Construction, a Georgetown, Texas-based company he has successfully led for more than 15 years. His experience as a business owner provides the Foundation with valuable expertise in financial management, operations, project coordination, and organizational leadership. He also brings extensive construction and housing industry knowledge that helps support the Foundation's affordable housing initiatives.",
      "A longtime Georgetown resident of more than 24 years, Scott and his wife, Christy, have been married for 37 years and have raised two daughters together. Scott and Christy are active members of their local church, where they serve through ministry, fellowship, and community engagement. Scott has also participated in mission work in Mexico, demonstrating a commitment to serving others both locally and abroad.",
    ],
  },
  {
    name: "Reid Whitesides",
    role: "Founder & Chief Strategy Officer",
    governanceRole: "Founder & Chief Strategy Officer",
    initials: "RW",
    photo: "/Images/team/reid-whitesides.jpg",
    shortBio:
      "A builder and technologist with over 20 years in construction and housing, Reid founded FAITH Foundation out of his own journey through addiction, incarceration, and recovery to help others find stability through a home.",
    bio: [
      "Reid Whitesides is the Founder and Chief Strategy Officer of FAITH Foundation, bringing more than 20 years of experience in construction, roofing, project management, sales, and consulting to the organization's leadership. He also applies deep expertise in technology and software development — building the operational systems, platforms, and automation tools that keep the Foundation running efficiently and positioned to scale its impact across Texas.",
      "Reid's commitment to this work is deeply personal. During a prolonged struggle with addiction, he spent nearly twenty years incarcerated in the State of Texas — giving him firsthand understanding of the barriers families face when rebuilding after addiction, incarceration, and housing instability. Today, sober for more than fifteen years, he channels that experience into leadership grounded in empathy, accountability, and the conviction that stable housing is the first step toward a rebuilt life. He credits his Christian faith and God's transformative work as the foundation of his recovery and purpose.",
      "Reid and his wife, Mary Ann, are recently married and are growing their family in Texas.",
    ],
  },
];

/**
 * The roster as the public site may render it.
 *
 * An entry without a real name is not a director the public should be told
 * about — it is an unfinished edit. Filtering here rather than at each call
 * site means no page can leak one by forgetting to check.
 */
export const BOARD: readonly BoardMember[] = ROSTER.filter(
  (member) => member.name.trim().length > 0
);
