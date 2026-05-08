const PROVIDER_NAME = "cortecs";
const PROVIDER_DISPLAY_NAME = "Cortecs";
const BASE_URL = "https://api.cortecs.ai/v1";
const API_KEY_ENV_VAR = "CORTECS_API_KEY";
const DEFAULT_CONTEXT_WINDOW = 128000;
const MAX_OUTPUT_TOKENS = 32768;
function hasTag(model, tag) {
    return (model.tags ?? []).some((value) => value.toLowerCase() === tag.toLowerCase());
}
function parseCost(raw) {
    if (raw === null || raw === undefined)
        return 0;
    const value = typeof raw === "number" ? raw : Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
}
function toRegisteredModel(model) {
    if (!hasTag(model, "Tools"))
        return undefined;
    const contextWindow = model.context_size ?? DEFAULT_CONTEXT_WINDOW;
    const input = hasTag(model, "Image") ? ["text", "image"] : ["text"];
    return {
        id: model.id,
        name: model.id,
        reasoning: hasTag(model, "Reasoning"),
        input,
        cost: {
            input: parseCost(model.pricing?.input_token),
            output: parseCost(model.pricing?.output_token),
            cacheRead: parseCost(model.pricing?.cache_read_cost),
            cacheWrite: parseCost(model.pricing?.cache_write_cost),
        },
        contextWindow,
        maxTokens: Math.min(contextWindow, MAX_OUTPUT_TOKENS),
        compat: {
            supportsDeveloperRole: false,
            maxTokensField: "max_tokens",
        },
    };
}
async function fetchModels() {
    const apiKey = process.env[API_KEY_ENV_VAR];
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined;
    try {
        const res = await fetch(`${BASE_URL}/models`, { headers });
        if (!res.ok) {
            console.warn(`[${PROVIDER_NAME}] API returned ${res.status}: ${res.statusText}`);
            return undefined;
        }
        const response = (await res.json());
        if (!Array.isArray(response.data)) {
            console.warn(`[${PROVIDER_NAME}] Unexpected API response shape`);
            return undefined;
        }
        return response.data.flatMap((model) => {
            const registeredModel = toRegisteredModel(model);
            return registeredModel ? [registeredModel] : [];
        });
    }
    catch (error) {
        console.warn(`[${PROVIDER_NAME}] Failed to fetch models:`, error);
        return undefined;
    }
}
export default async function (pi) {
    const models = await fetchModels();
    if (!models)
        return;
    pi.registerProvider(PROVIDER_NAME, {
        name: PROVIDER_DISPLAY_NAME,
        baseUrl: BASE_URL,
        apiKey: API_KEY_ENV_VAR,
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
            const items = [...models]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((model) => {
                const tags = [];
                if (model.reasoning)
                    tags.push("reasoning");
                if (model.input.includes("image"))
                    tags.push("vision");
                return tags.length > 0 ? `${model.id} (${tags.join(", ")})` : model.id;
            });
            await ctx.ui.select(`${PROVIDER_DISPLAY_NAME} — ${models.length} models`, items);
        },
    });
}
