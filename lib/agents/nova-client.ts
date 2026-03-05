/**
 * Amazon Nova client helpers used by stage workers.
 */
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";

type NovaTier = "pro" | "lite";

interface NovaGenerationOptions {
  tier: NovaTier;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_REGION = "us-east-1";
const DEFAULT_PRO_MODEL_ID = "us.amazon.nova-pro-v1:0";
const DEFAULT_LITE_MODEL_ID = "us.amazon.nova-lite-v1:0";

let cachedRegion: string | null = null;
let cachedClient: BedrockRuntimeClient | null = null;

/**
 * Returns the Bedrock region configured for Nova calls.
 */
function getBedrockRegion(): string {
  return process.env.AWS_REGION?.trim() || DEFAULT_REGION;
}

/**
 * Returns model IDs for Nova Pro/Lite with environment override support.
 */
function getModelIds() {
  return {
    pro: process.env.ZONNOVA_NOVA_PRO_MODEL_ID?.trim() || DEFAULT_PRO_MODEL_ID,
    lite:
      process.env.ZONNOVA_NOVA_LITE_MODEL_ID?.trim() || DEFAULT_LITE_MODEL_ID,
  };
}

/**
 * Returns a cached Bedrock runtime client per region.
 */
function getBedrockClient(region: string): BedrockRuntimeClient {
  if (cachedClient && cachedRegion === region) {
    return cachedClient;
  }

  cachedRegion = region;
  cachedClient = new BedrockRuntimeClient({ region });
  return cachedClient;
}

/**
 * Extracts plain text content from Bedrock Converse responses.
 */
function extractTextFromConverseResponse(response: ConverseCommandOutput): string {
  const blocks = response.output?.message?.content ?? [];
  const parts = blocks
    .map((block) => {
      const text = (block as { text?: string }).text;
      return typeof text === "string" ? text : "";
    })
    .filter((part) => part.length > 0);

  return parts.join("\n").trim();
}

/**
 * Generates text using Amazon Nova through the Bedrock Converse API.
 */
export async function generateNovaText(
  options: NovaGenerationOptions,
): Promise<string> {
  const region = getBedrockRegion();
  const modelIds = getModelIds();
  const modelId = options.tier === "pro" ? modelIds.pro : modelIds.lite;
  const client = getBedrockClient(region);

  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [{ text: options.systemPrompt }],
      messages: [
        {
          role: "user",
          content: [{ text: options.userPrompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: options.maxTokens ?? 1200,
        temperature: options.temperature ?? 0.2,
      },
    }),
  );

  const outputText = extractTextFromConverseResponse(response);
  if (!outputText) {
    throw new Error(`Nova model returned empty content for ${modelId}.`);
  }

  return outputText;
}
