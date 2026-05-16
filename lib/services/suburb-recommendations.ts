import {
  getStaticSuburbRecommendations,
  type SuburbRecommendation,
  type SuburbRecommendationResult,
} from "@/lib/student-plan";

type OpenAiSuburbResponse = {
  institutionValid: boolean;
  institutionName: string;
  message: string;
  recommendations: SuburbRecommendation[];
  sources: string[];
};

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    action?: {
      sources?: Array<{
        url?: string;
      }>;
    };
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const suburbRecommendationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["institutionValid", "institutionName", "message", "recommendations", "sources"],
  properties: {
    institutionValid: { type: "boolean" },
    institutionName: { type: "string" },
    message: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "suburb",
          "proximity",
          "medianWeeklyRent",
          "benefits",
          "freeTramZone",
          "jobProspects",
          "transportNotes",
          "sourceUrls",
        ],
        properties: {
          suburb: { type: "string" },
          proximity: { type: "string" },
          medianWeeklyRent: { type: "string" },
          benefits: {
            type: "array",
            items: { type: "string" },
          },
          freeTramZone: { type: "string" },
          jobProspects: { type: "string" },
          transportNotes: { type: "string" },
          sourceUrls: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    sources: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function getOpenAiApiKey() {
  return process.env.OPEN_AI_API_KEY ?? process.env.OPENAI_API_KEY;
}

function extractOutputText(response: OpenAiResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function extractSearchSources(response: OpenAiResponse) {
  return (
    response.output
      ?.flatMap((item) => item.action?.sources ?? [])
      .map((source) => source.url)
      .filter((url): url is string => Boolean(url)) ?? []
  );
}

function normalizeRecommendations(
  city: string,
  institution: string,
  response: OpenAiSuburbResponse,
  webSearchSources: string[],
): SuburbRecommendationResult {
  if (!response.institutionValid) {
    return getStaticSuburbRecommendations(city, institution);
  }

  const recommendations = response.recommendations
    .filter((item) => item.suburb.trim())
    .slice(0, 4)
    .map((item) => ({
      suburb: item.suburb.trim(),
      proximity: item.proximity.trim() || "Compare commute time with the confirmed campus address.",
      medianWeeklyRent: item.medianWeeklyRent.trim() || "Check current listings",
      benefits: item.benefits.filter(Boolean).slice(0, 4),
      freeTramZone: item.freeTramZone.trim() || (city === "Melbourne" ? "Check current tram zone maps" : "Not applicable"),
      jobProspects: item.jobProspects.trim() || "Check local retail, hospitality, and campus job boards.",
      transportNotes: item.transportNotes.trim() || "Check local public transport before applying.",
      sourceUrls: item.sourceUrls.filter(Boolean).slice(0, 4),
    }));

  if (recommendations.length === 0) {
    return {
      status: "error",
      institutionName: response.institutionName || institution,
      message: "We could verify the institution, but could not generate suburb recommendations.",
      recommendations: [],
      sources: response.sources.filter(Boolean).slice(0, 6),
    };
  }

  return {
    status: "ai",
    institutionName: response.institutionName || institution,
    message: response.message || "AI suburb recommendations based on your city and university or college.",
    recommendations,
    sources: Array.from(new Set([...response.sources.filter(Boolean), ...webSearchSources])).slice(0, 6),
  };
}

export async function requestSuburbRecommendations(city: string, institution: string): Promise<SuburbRecommendationResult> {
  const apiKey = getOpenAiApiKey();
  const cleanInstitution = institution.trim();
  const model = process.env.OPENAI_SUBURB_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return {
      status: "error",
      institutionName: cleanInstitution,
      message: "OpenAI API key is not configured, so suburb recommendations could not be generated.",
      recommendations: [],
      sources: [],
    };
  }

  const requestBody: Record<string, unknown> = {
    model,
    tools: [
      {
        type: "web_search",
        user_location: {
          type: "approximate",
          country: "AU",
          city,
          timezone: "Australia/Melbourne",
        },
      },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    max_output_tokens: 1600,
    text: {
      format: {
        type: "json_schema",
        name: "student_suburb_recommendations",
        strict: true,
        schema: suburbRecommendationSchema,
      },
    },
    input: [
      {
        role: "system",
        content:
          "You are an Australian international student housing assistant. Return only JSON matching the schema. Use web search for current public information. Do not invent universities, campuses, rent figures, or transport claims.",
      },
      {
        role: "user",
        content: `City: ${city}
University or college entered by student: ${cleanInstitution}

Tasks:
1. Verify whether the entered university or college has a real campus in the selected Australian city.
2. If it is invalid, misspelled beyond confident recognition, outside the selected city, or too ambiguous, set institutionValid=false and leave recommendations empty.
3. If valid, recommend 4 suburbs for an international student. Prefer suburbs with practical commute options to the campus, realistic weekly rent expectations, groceries/services, student community, and casual job prospects.
4. medianWeeklyRent must be an approximate weekly private-room/shared-housing or student-accommodation estimate, not a yearly or monthly figure. Use ranges where sources vary.
5. proximity must mention approximate commute or campus relationship.
6. freeTramZone should mention whether this helps for the campus/suburb commute. For cities without Melbourne's Free Tram Zone, say "Not applicable".
7. Include source URLs used for rent, transport, institution/campus validation, or local context.`,
      },
    ],
  };

  if (model.startsWith("gpt-5") || /^o\d/.test(model)) {
    requestBody.reasoning = { effort: "low" };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const message = await response.text();
    return {
      status: "error",
      institutionName: cleanInstitution,
      message: `OpenAI suburb recommendations failed: ${message || response.statusText}`,
      recommendations: [],
      sources: [],
    };
  }

  const data = (await response.json()) as OpenAiResponse;
  const outputText = extractOutputText(data);
  const webSearchSources = extractSearchSources(data);

  if (!outputText) {
    return {
      status: "error",
      institutionName: cleanInstitution,
      message: "OpenAI returned an empty suburb recommendation response.",
      recommendations: [],
      sources: [],
    };
  }

  try {
    return normalizeRecommendations(city, cleanInstitution, JSON.parse(outputText) as OpenAiSuburbResponse, webSearchSources);
  } catch {
    return {
      status: "error",
      institutionName: cleanInstitution,
      message: "OpenAI returned suburb recommendations in an unexpected format.",
      recommendations: [],
      sources: [],
    };
  }
}
