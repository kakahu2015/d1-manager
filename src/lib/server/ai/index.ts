import type { BaseChatMessage, BaseChatMessageRole, BaseChatParam } from "@ai-d/aid";
import { Aid } from "@ai-d/aid";
import debug from "debug";

debug.enable("aid*");

const log = debug("assistant");
log.enabled = true;

const CFAI_MODEL = "@cf/defog/sqlcoder-7b-2";

/**
 * Returns the AI model information.
 */
export function getAiInfo(): string {
    return `Cloudflare (${CFAI_MODEL})`;
}

export type AiBackend = Aid<
    string,
    BaseChatParam,
    BaseChatMessage<BaseChatMessageRole>[],
    BaseChatMessage<BaseChatMessageRole>[]
>;

export async function select_backend(): Promise<AiBackend> {
    log("using Cloudflare backend");
    return Aid.chat(async (messages) => {
        const { Ai } = await import("$lib/../../cfai/cfai");
        const ai = new Ai(); // 假设 Ai 构造函数不需要参数
        const { response } = await ai.run(CFAI_MODEL, {
            messages,
        });

        const res: string = response;
        const match = res.match(/{\s*"sql":\s*".*?"\s*}/);
        if (match) {
            return match[0];
        }

        return res;
    });
}
