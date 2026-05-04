import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side only.
 * 環境変数: ANTHROPIC_API_KEY
 */
let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

/** ひとつの本命モデル: Haiku 4.5 (速くて安い) */
export const HITOTSU_MODEL = "claude-haiku-4-5-20251001";
