export const meetingSearchUrl =
  "https://lacoaa.org/meetings.php?lat=0&lng=0&pday=0&pformat=0&pmethod=1&pregion=0&ptime=0&ptype=Y#search"

export const site = {
  name: "VALLEYPAA",
  fullName: "Valley Young People in Alcoholics Anonymous",
  description:
    "A young people in Alcoholics Anonymous committee serving the San Fernando Valley through meetings, service, fellowship, and events.",
  links: {
    home: "/",
    getInvolved: "/get-involved",
    events: "/upcoming-events",
    newsletters: "/newsletters",
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
    key: "meetings",
    label: "LA YP Meetings",
    href: site.links.meetings,
    external: true,
  },
]

export const stats = [
  { value: "SFV", label: "local service area" },
  { value: "YPAA", label: "young people in AA" },
  { value: "All", label: "ages welcome" },
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
    question: "Do I have to be young to show up?",
    answer:
      "No. Young people committees focus on people who got sober young, young newcomers, and young-at-heart AA members. Anyone with a desire to stop drinking is welcome around AA.",
  },
  {
    question: "Where do I find young people meetings?",
    answer:
      "Use the LA YP Meetings nav link to open the Los Angeles Central Office young people meeting search.",
  },
  {
    question: "Can I help even if I am new?",
    answer:
      "Yes. YPAA service is built for newcomers and longtime members working together. Start with a committee meeting or reach out through the contact link once it is connected.",
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
