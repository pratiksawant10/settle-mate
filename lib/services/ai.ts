export type AiIntent = "planner" | "budget" | "rent" | "job" | "chat";

export async function requestMockAiSummary(intent: AiIntent, prompt: string) {
  // Future AI/API integration: replace this mock with a server action or API route
  // that calls the selected model, adds safety guardrails, and logs consented usage.
  return {
    intent,
    prompt,
    generatedAt: new Date().toISOString(),
    summary: "Mock AI response generated locally for the MVP demo.",
  };
}
