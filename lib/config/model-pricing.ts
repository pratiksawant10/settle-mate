export type ModelPricing = {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
};

export const modelPricing: Record<string, ModelPricing> = {
  "gpt-5.4-mini": {
    inputPerMillionUsd: 0.75,
    outputPerMillionUsd: 4.5,
  },
  "gpt-4.1-mini": {
    inputPerMillionUsd: 0.4,
    outputPerMillionUsd: 1.6,
  },
  "gpt-4o-mini": {
    inputPerMillionUsd: 0.15,
    outputPerMillionUsd: 0.6,
  },
};

function getModelPricing(model: string) {
  const normalizedModel = Object.keys(modelPricing).find(
    (knownModel) => model === knownModel || model.startsWith(`${knownModel}-`),
  );

  return normalizedModel ? modelPricing[normalizedModel] : modelPricing["gpt-5.4-mini"];
}

export function calculateEstimatedCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const pricing = getModelPricing(model);
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillionUsd;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillionUsd;

  return Number((inputCost + outputCost).toFixed(6));
}

export function estimateTokensFromText(text: string) {
  // TODO: Replace this approximation with tokenizer-backed counting if provider usage is unavailable.
  return Math.max(1, Math.ceil(text.length / 4));
}
