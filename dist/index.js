/**
 * Cortecs — pi extension
 *
 * Fetches the current Cortecs model catalog on startup and registers
 * tool-capable text-generation models as a "cortecs" provider.
 *
 * Environment:
 *   CORTECS_API_KEY — required, Cortecs API key
 *
 * Usage:
 *   pi -e /path/to/pi-cortecs
 *   pi -e /path/to/pi-cortecs --provider cortecs
 *   pi -e /path/to/pi-cortecs --provider cortecs --model claude-sonnet-4
 */
const PROVIDER_NAME = "cortecs";
const BASE_URL = "https://api.cortecs.ai/v1";
const ENV_VAR = "CORTECS_API_KEY";
// ============================================================================
// Helpers
// ============================================================================
function hasTag(model, tag) {
    return (model.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase());
}
function isToolCapableTextModel(model) {
    return hasTag(model, "Tools");
}
function parseInputModalities(model) {
    const input = ["text"];
    if (hasTag(model, "Image"))
        input.push("image");
    return input;
}
function parseCostPerMillion(raw) {
    if (raw === null || raw === undefined)
        return 0;
    return typeof raw === "number" ? raw : parseFloat(raw || "0");
}
function isReasoningModel(model) {
    return hasTag(model, "Reasoning");
}
// ============================================================================
// Extension entry point
// ============================================================================
export default async function (pi) {
    const apiKey = process.env[ENV_VAR];
    if (!apiKey) {
        return;
    }
    let response;
    try {
        const res = await fetch(`${BASE_URL}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) {
            console.warn(`[${PROVIDER_NAME}] API returned ${res.status}: ${res.statusText}`);
            return;
        }
        response = (await res.json());
    }
    catch (error) {
        console.warn(`[${PROVIDER_NAME}] Failed to fetch models:`, error);
        return;
    }
    if (!Array.isArray(response.data)) {
        console.warn(`[${PROVIDER_NAME}] Unexpected API response shape`);
        return;
    }
    const models = [];
    for (const model of response.data) {
        if (!isToolCapableTextModel(model))
            continue;
        const contextWindow = model.context_size || 128000;
        models.push({
            id: model.id,
            name: model.id,
            reasoning: isReasoningModel(model),
            input: parseInputModalities(model),
            cost: {
                input: parseCostPerMillion(model.pricing?.input_token),
                output: parseCostPerMillion(model.pricing?.output_token),
                cacheRead: parseCostPerMillion(model.pricing?.cache_read_cost),
                cacheWrite: parseCostPerMillion(model.pricing?.cache_write_cost),
            },
            contextWindow,
            maxTokens: Math.min(contextWindow, 32768),
            compat: {
                supportsDeveloperRole: false,
                maxTokensField: "max_tokens",
            },
        });
    }
    pi.registerProvider(PROVIDER_NAME, {
        name: "Cortecs",
        baseUrl: BASE_URL,
        apiKey: ENV_VAR,
        api: "openai-completions",
        models,
    });
    pi.registerCommand("cortecs-models", {
        description: "List available Cortecs models",
        handler: async (_args, ctx) => {
            if (models.length === 0) {
                ctx.ui.notify("No Cortecs models available", "warning");
                return;
            }
            const items = models
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((model) => {
                const tags = [];
                if (model.reasoning)
                    tags.push("reasoning");
                if (model.input.includes("image"))
                    tags.push("vision");
                const suffix = tags.length > 0 ? ` (${tags.join(", ")})` : "";
                return `${model.id}${suffix}`;
            });
            await ctx.ui.select(`Cortecs — ${models.length} models`, items);
        },
    });
}
