// Mock data for NGF Futures Lab platform UI prototype.

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const ZONES = {
  "North Central": ["Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
  "North East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  "North West": ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  "South West": ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
};

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export type StateMetrics = {
  name: string;
  zone: string;
  resilienceIndex: number; // 0-100
  fiscalHealth: number;
  humanCapital: number;
  climateRisk: number;
  securityIndex: number;
  innovationCapacity: number;
  populationMillions: number;
  igrBillion: number; // Internally generated revenue
  unemploymentRate: number;
  povertyRate: number;
  surveyCompletion: number; // %
  lastSubmission: string;
  status: "submitted" | "in-progress" | "overdue";
};

const zoneOf = (state: string) =>
  Object.entries(ZONES).find(([, list]) => list.includes(state))?.[0] ?? "—";

export const STATE_METRICS: StateMetrics[] = NIGERIAN_STATES.map((name, i) => {
  const r = seedRand(i + 7);
  const submitted = r() > 0.18;
  return {
    name,
    zone: zoneOf(name),
    resilienceIndex: Math.round(35 + r() * 55),
    fiscalHealth: Math.round(30 + r() * 60),
    humanCapital: Math.round(30 + r() * 60),
    climateRisk: Math.round(20 + r() * 70),
    securityIndex: Math.round(30 + r() * 60),
    innovationCapacity: Math.round(20 + r() * 60),
    populationMillions: +(2 + r() * 14).toFixed(1),
    igrBillion: +(8 + r() * 280).toFixed(1),
    unemploymentRate: +(8 + r() * 25).toFixed(1),
    povertyRate: +(15 + r() * 65).toFixed(1),
    surveyCompletion: Math.round(40 + r() * 60),
    lastSubmission: `2026-${String(Math.ceil(r() * 4)).padStart(2, "0")}-${String(
      Math.ceil(r() * 27),
    ).padStart(2, "0")}`,
    status: submitted ? (r() > 0.4 ? "submitted" : "in-progress") : "overdue",
  };
});

export const SNRI_TREND = [
  { period: "Q1 2024", index: 48 },
  { period: "Q2 2024", index: 51 },
  { period: "Q3 2024", index: 53 },
  { period: "Q4 2024", index: 55 },
  { period: "Q1 2025", index: 57 },
  { period: "Q2 2025", index: 59 },
  { period: "Q3 2025", index: 60 },
  { period: "Q4 2025", index: 62 },
  { period: "Q1 2026", index: 64 },
];

export const SECTOR_PERFORMANCE = [
  { sector: "Health", current: 62, target: 80 },
  { sector: "Education", current: 58, target: 78 },
  { sector: "Agriculture", current: 71, target: 85 },
  { sector: "Infrastructure", current: 54, target: 75 },
  { sector: "Security", current: 49, target: 72 },
  { sector: "Digital Econ.", current: 43, target: 70 },
];

export const RESILIENCE_RADAR = [
  { dim: "Fiscal", value: 68 },
  { dim: "Human Capital", value: 62 },
  { dim: "Climate", value: 51 },
  { dim: "Security", value: 47 },
  { dim: "Innovation", value: 55 },
  { dim: "Institutional", value: 64 },
];

export const SCENARIOS = [
  {
    id: "baseline",
    name: "Baseline 2030",
    probability: 42,
    growth: 3.4,
    poverty: 38,
    summary: "Current trajectory continues with moderate reforms.",
  },
  {
    id: "accelerated",
    name: "Accelerated Reform",
    probability: 28,
    growth: 6.1,
    poverty: 24,
    summary: "Aggressive subnational investment, AfCFTA leveraged fully.",
  },
  {
    id: "shock",
    name: "Climate & Security Shock",
    probability: 18,
    growth: 0.8,
    poverty: 51,
    summary: "Compounding climate and insurgency stress collapses fiscal space.",
  },
  {
    id: "leapfrog",
    name: "Digital Leapfrog",
    probability: 12,
    growth: 7.8,
    poverty: 19,
    summary: "States adopt AI, digital ID and green industrial corridors.",
  },
];

export const RESEARCH_PROJECTS = [
  { title: "Sub-National Resilience Index v2", lead: "Dr. A. Bello", status: "Field testing", progress: 72 },
  { title: "Climate Migration Foresight: Sahel Belt", lead: "F. Okonjo", status: "Modelling", progress: 45 },
  { title: "AfCFTA State Readiness Study", lead: "Dr. M. Yusuf", status: "Drafting", progress: 88 },
  { title: "Youth Employment Scenarios 2035", lead: "C. Eze", status: "Data collection", progress: 31 },
  { title: "Fiscal Volatility Stress-Tests", lead: "Dr. K. Adeyemi", status: "Peer review", progress: 94 },
];

export const INNOVATION_PILOTS = [
  { state: "Kaduna", title: "AI Crop-Yield Advisory", stage: "Scaling", impact: "12k farmers" },
  { state: "Lagos", title: "Predictive Flood Early-Warning", stage: "Pilot", impact: "3 LGAs" },
  { state: "Kano", title: "Out-of-School Children Re-entry", stage: "Active", impact: "48k learners" },
  { state: "Cross River", title: "Tourism Value-Chain Lab", stage: "Design", impact: "—" },
  { state: "Plateau", title: "Conflict Early-Warning Network", stage: "Active", impact: "9 communities" },
];

export const REPORTS = [
  { title: "State of the States 2025", type: "Flagship", date: "Dec 2025", pages: 184, downloads: 12450 },
  { title: "Sub-National Resilience Index Q4", type: "Index Brief", date: "Jan 2026", pages: 42, downloads: 4820 },
  { title: "Climate Foresight: Northern Nigeria", type: "Foresight", date: "Mar 2026", pages: 76, downloads: 2310 },
  { title: "Digital Economy Readiness", type: "Diagnostic", date: "Feb 2026", pages: 58, downloads: 1980 },
  { title: "AfCFTA State Opportunities", type: "Policy Brief", date: "Apr 2026", pages: 24, downloads: 3120 },
];

export const SURVEY_INSTRUMENTS = [
  { id: "Q1-2026-CORE", title: "Quarterly Core Indicators", sections: 8, questions: 124, dueDate: "2026-05-30", responseRate: 78 },
  { id: "FISCAL-2026", title: "Fiscal Sustainability Survey", sections: 5, questions: 62, dueDate: "2026-06-15", responseRate: 64 },
  { id: "CLIMATE-26", title: "Climate Vulnerability Assessment", sections: 6, questions: 88, dueDate: "2026-07-01", responseRate: 41 },
  { id: "DIGITAL-26", title: "Digital Readiness Diagnostic", sections: 4, questions: 54, dueDate: "2026-06-30", responseRate: 52 },
];

export const ALERTS = [
  { level: "high", title: "Borno security index dropped 8 pts", time: "2h ago" },
  { level: "medium", title: "Sokoto Q1 survey overdue", time: "5h ago" },
  { level: "info", title: "12 states submitted fiscal data this week", time: "1d ago" },
  { level: "high", title: "Flood risk model: 7 southern states elevated", time: "1d ago" },
];
