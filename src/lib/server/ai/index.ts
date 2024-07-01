import { env } from "$env/dynamic/private";
import type { BaseChatMessage, BaseChatMessageRole, BaseChatParam } from "@ai-d/aid";
import { Aid } from "@ai-d/aid";
import debug from "debug";

debug.enable("aid*");

const log = debug("assistant");
log.enabled = true;

const OPENAI_MODEL = env.OPENAI_MODEL || "gpt-3.5-turbo-1106";
//const CFAI_MODEL = env.CFAI_MODEL || "@cf/defog/sqlcoder-7b-2";
const CFAI_MODEL = "@cf/defog/sqlcoder-7b-2";

/**
 * Checks the availability of AI models.
 */
export function available(): string | null {
	//if (env.OPENAI_API_KEY) {
	//	return `OpenAI (${OPENAI_MODEL})`;
	//}

	//if (env.AI) {
	//	return `Cloudflare (${CFAI_MODEL})`;
	//}

	//return null;
    return `Cloudflare (${CFAI_MODEL})`;
}

export type AiBackend =
	| Aid<
			string,
			BaseChatParam,
			BaseChatMessage<BaseChatMessageRole>[],
			BaseChatMessage<BaseChatMessageRole>[]
	  >
	| undefined;

export async function select_backend(): Promise<AiBackend> {
	if (1>2) {
		log("using OpenAI backend");
		const { OpenAI } = await import("openai");
		return Aid.from(
			new OpenAI({
				baseURL: env.OPENAI_API_URL,
				apiKey: env.OPENAI_API_KEY,
			}),
			{ model: OPENAI_MODEL },
		);
	}

	if (1<2) {
		log("using Cloudflare backend");
		return Aid.chat(async (messages) => {
			const { Ai } = await import("$lib/../../cfai/cfai");
			const ai = new Ai(env.AI);
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

	log("no backend");
	return undefined;
}
