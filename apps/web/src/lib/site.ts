export const meetingSearchUrl =
  "https://lacoaa.org/meetings.php?lat=0&lng=0&pday=0&pformat=0&pmethod=1&pregion=0&ptime=0&ptype=Y#search"

// Single source of truth for geography — used by page copy and by the
// structured data in lib/structured-data.ts so the two can't drift.
export const serviceArea = {
  region: "San Fernando Valley",
  city: "Los Angeles",
  county: "Los Angeles County",
  state: "CA",
  neighborhoods: [
    "Canoga Park",
    "Reseda",
    "Van Nuys",
    "North Hollywood",
    "Woodland Hills",
    "Sherman Oaks",
    "Northridge",
    "Studio City",
  ],
}

export const site = {
  name: "VALLEYPAA",
  fullName: "Valley Young People in Alcoholics Anonymous",
  description:
    "A young people in Alcoholics Anonymous committee serving the San Fernando Valley, Los Angeles — sober events, meetings, service, and fellowship.",
  links: {
    home: "/",
    getInvolved: "/get-involved",
    events: "/upcoming-events",
    newsletters: "/newsletters",
    dailyReflection: "/daily-reflection",
    meetings: meetingSearchUrl,
    instagram: "https://www.instagram.com/valleypaa/",
    contact: "/get-involved#contact",
  },
  contactEmail: "Contact link coming soon",
}

export const navItems = [
  { key: "home", label: "Home", href: site.links.home },
  { key: "get-involved", label: "Get Involved", href: site.links.getInvolved },
  { key: "upcoming-events", label: "Upcoming Events", href: site.links.events },
  { key: "newsletters", label: "Newsletters", href: site.links.newsletters },
  {
    key: "daily-reflection",
    label: "Daily Reflection",
    href: site.links.dailyReflection,
  },
  {
    key: "meetings",
    label: "LA YP Meetings",
    href: site.links.meetings,
    external: true,
  },
]

export const businessMeeting = {
  title: "Business Meeting",
  schedule: "Second Saturday of each month",
  time: "2 pm",
  location: "Hole in the Sky",
  address: "21520 Sherman Way, Canoga Park, CA 91303",
}

export const involvement = [
  "Events and programming",
  "Outreach to young people meetings",
  "Speaker and hospitality service",
  "Setup, coffee, and clean-up crew",
]

export const faqs = [
  {
    question: "What is VALLEYPAA?",
    answer:
      "VALLEYPAA (Valley Young People in Alcoholics Anonymous) is a volunteer AA committee in the San Fernando Valley, the northwest section of the City of Los Angeles. We put on sober events and carry the AA message to young people who still suffer. We are not a treatment center, a nonprofit, or a business — just AA members doing service.",
  },
  {
    question: "Are VALLEYPAA events in Los Angeles?",
    answer:
      "Yes. The San Fernando Valley is part of the City and County of Los Angeles. Our events happen in Canoga Park, Reseda, Van Nuys, North Hollywood, and Woodland Hills — twenty to forty minutes from Hollywood or downtown depending on the 101. If you are looking for sober events in the Los Angeles area, we are the north end of it.",
  },
  {
    question: "What counts as a sober event?",
    answer:
      "An event with no alcohol and no drugs, put on by and for people in recovery. Ours look like dances and speaker jams, beach days and hikes, campouts and holiday parties, markets, and meetings. Nothing costs money to walk into; some events pass a basket, because AA is self-supporting through its own members' contributions and does not take outside money.",
  },
  {
    question: "Do I have to be sober to come?",
    answer:
      "No, and you do not have to be in AA. The only thing we ask is that you do not bring alcohol or drugs. The only requirement for AA membership is a desire to stop drinking.",
  },
  {
    question: "Do I have to be young to show up?",
    answer:
      "No. Young people committees focus on people who got sober young, young newcomers, and young-at-heart AA members. Nobody checks an ID, and anyone with a desire to stop drinking is welcome around AA.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Nothing. AA has no dues or fees, and our events are free to walk into.",
  },
  {
    question: "Are you the same as LACYPAA?",
    answer:
      "No. LACYPAA is Los Angeles County Young People in AA; VALLEYPAA is the San Fernando Valley committee. Different committees, same fellowship — and we show up at each other's events.",
  },
  {
    question: "Where do I find AA meetings in the Los Angeles area?",
    answer:
      "Use the Los Angeles Central Office (LACOAA) young people meeting search for meetings across Los Angeles County. For San Fernando Valley schedules, see the San Fernando Valley Central Office at sfvaa.org.",
  },
  {
    question: "When and where is your business meeting?",
    answer: `${businessMeeting.schedule}, ${businessMeeting.time}, at ${businessMeeting.location}, ${businessMeeting.address}. Anyone can come.`,
  },
  {
    question: "Can I help even if I am new?",
    answer:
      "Yes. YPAA service is built for newcomers and longtime members working together. Start by walking into a committee business meeting — that is the whole onboarding.",
  },
  {
    question: "Is this an official Alcoholics Anonymous website?",
    answer:
      "No. VALLEYPAA is a committee of AA members. We are not affiliated with, endorsed by, or speaking for Alcoholics Anonymous World Services or any A.A. service body, and nothing here is an official A.A. position.",
  },
]

export const imageCredits = [
  {
    label: "San Fernando Valley image",
    href: "https://commons.wikimedia.org/wiki/File:San_Fernando_Valley_from_Southeast_Edge.jpg",
    credit: "RogerHam, CC BY 3.0",
  },
  {
    label: "Stage lights image",
    href: "https://unsplash.com/photos/empty-stage-with-lights-8XxF2kYHIgo",
    credit: "Elijah Ekdahl, Unsplash",
  },
  {
    label: "Blurred lights image",
    href: "https://unsplash.com/photos/blurred-stage-lights-with-audience-silhouettes-HgD2kVqgHic",
    credit: "Ryan Spaulding, Unsplash",
  },
  {
    label: "Business meeting flyer",
    href: "https://www.instagram.com/valleypaa/",
    credit: "VALLEYPAA",
  },
]
