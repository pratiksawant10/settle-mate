export type Concern = "housing" | "job" | "budget" | "visa" | "loneliness" | "transport" | "study pressure";

export type PlannerForm = {
  name: string;
  origin: string;
  city: string;
  institution: string;
  startDate: string;
  monthlyBudget: string;
  accommodation: string;
  partTime: "yes" | "no";
  concern: Concern;
};

export type SuburbRecommendationStatus = "ai" | "static" | "loading" | "error";

export type SuburbRecommendation = {
  suburb: string;
  proximity: string;
  medianWeeklyRent: string;
  benefits: string[];
  freeTramZone: string;
  jobProspects: string;
  transportNotes: string;
  sourceUrls: string[];
};

export type SuburbRecommendationResult = {
  status: SuburbRecommendationStatus;
  message: string;
  institutionName: string;
  recommendations: SuburbRecommendation[];
  sources: string[];
};

export const citySuburbs: Record<string, string[]> = {
  Melbourne: ["Clayton", "Footscray", "Box Hill", "Carlton", "Brunswick"],
  Sydney: ["Parramatta", "Strathfield", "Burwood", "Ultimo", "Kensington"],
  Brisbane: ["St Lucia", "Toowong", "Kelvin Grove", "South Bank", "Woolloongabba"],
  Adelaide: ["North Adelaide", "Mawson Lakes", "Unley", "Norwood", "Bowden"],
  Perth: ["Bentley", "Crawley", "Joondalup", "Victoria Park", "Northbridge"],
  Canberra: ["Acton", "Belconnen", "Braddon", "Dickson", "Gungahlin"],
};

export const emptyPlannerForm: PlannerForm = {
  name: "",
  origin: "",
  city: "Melbourne",
  institution: "",
  startDate: "",
  monthlyBudget: "",
  accommodation: "Private room in shared house",
  partTime: "yes",
  concern: "housing",
};

export function getStaticSuburbRecommendations(city: string, institutionName = ""): SuburbRecommendationResult {
  const suburbs = citySuburbs[city] ?? ["Near campus", "On a direct transport line", "Close to groceries"];

  return {
    status: "static",
    institutionName,
    message:
      "We could not verify that university or college in the selected city, so these are broad city-level starting suburbs.",
    recommendations: suburbs.map((suburb) => ({
      suburb,
      proximity: "Check commute time against the confirmed campus address.",
      medianWeeklyRent: "Check current listings",
      benefits: ["Broad city match", "Compare commute, rent, groceries, and inspection quality"],
      freeTramZone: city === "Melbourne" ? "May vary by campus and commute route" : "Not applicable",
      jobProspects: "Check nearby retail, hospitality, campus, and local shopping precincts.",
      transportNotes: "Use the local transport planner before applying for housing.",
      sourceUrls: [],
    })),
    sources: [],
  };
}

export const loadingSuburbRecommendations: SuburbRecommendationResult = {
  status: "loading",
  message: "Finding suburb matches using your city and university or college.",
  institutionName: "",
  recommendations: [],
  sources: [],
};
