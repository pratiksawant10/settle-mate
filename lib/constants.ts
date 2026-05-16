import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Compass,
  MapPinned,
  MessageCircle,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/planner", label: "Planner" },
  { href: "/budget", label: "Budget" },
  { href: "/city-guides", label: "City Guides" },
  { href: "/ask-ai", label: "Ask AI" },
];

export const mobileNavItems = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/planner", label: "Plan", icon: Plane },
  { href: "/budget", label: "Budget", icon: Banknote },
  { href: "/city-guides", label: "City", icon: MapPinned },
  { href: "/ask-ai", label: "Ask", icon: MessageCircle },
];

export const cities = [
  "Melbourne",
  "Sydney",
  "Brisbane",
  "Adelaide",
  "Perth",
  "Canberra",
];

export const features = [
  {
    title: "AI Arrival Planner",
    description: "Generate a practical 7, 30, and 90 day plan for your city, course, budget, and priorities.",
    href: "/planner",
    icon: Plane,
  },
  {
    title: "Cost of Living Calculator",
    description: "Estimate monthly expenses, income, and whether your budget is comfortable, tight, or high risk.",
    href: "/budget",
    icon: Banknote,
  },
    {
    title: "City Survival Guides",
    description: "Scan transport, suburbs, cost, community, and safety tips for major Australian student cities.",
    href: "/city-guides",
    icon: MapPinned,
  },
  {
    title: "RentGuard AI",
    description: "Spot warning signs in rental listings before you pay bond, transfer money, or share documents.",
    href: "/rent-check",
    icon: ShieldCheck,
    comingSoon: true,
  },
  {
    title: "Part-Time Job Coach",
    description: "Get practical job ideas, resume tips, interview prompts, and workplace rights reminders.",
    href: "/job-coach",
    icon: BriefcaseBusiness,
    comingSoon: true,
  },
  {
    title: "Visa & Compliance Guide",
    description: "Keep important reminders visible and know when to check official sources or get professional help.",
    href: "/visa-guide",
    icon: CalendarCheck,
    comingSoon: true,
  },
];

export const supportPrompts = [
  { label: "Plan arrival", icon: Building2 },
  { label: "Check rent", icon: ShieldCheck },
  { label: "Find work", icon: BriefcaseBusiness },
  { label: "Ask AI", icon: MessageCircle },
];

export const audienceCountries = [
  "India",
  "Nepal",
  "Sri Lanka",
  "Vietnam",
  "China",
  "Philippines",
];

export const designNavItems = [
  ...navItems,
  { href: "/design-system", label: "Design System" },
];
