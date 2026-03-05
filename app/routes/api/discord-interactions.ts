import { container } from "~/lib/container";
import { DiscordInteractionsService } from "~/services/discord-interactions.server";
import { RedisModelBlacklistService } from "~/services/model-blacklist.server";
import { ProviderSelectionService } from "~/services/provider-selection.server";

interface DiscordInteractionOption {
	name: string;
	type: number;
	value?: string | number | boolean;
	options?: DiscordInteractionOption[];
}

interface DiscordInteraction {
	type: number;
	data?: {
		name?: string;
		options?: DiscordInteractionOption[];
	};
}

const INTERACTION_TYPE_PING = 1;
const INTERACTION_TYPE_APPLICATION_COMMAND = 2;
const INTERACTION_RESPONSE_TYPE_PONG = 1;
const INTERACTION_RESPONSE_TYPE_CHANNEL_MESSAGE_WITH_SOURCE = 4;
const EPHEMERAL_FLAG = 1 << 6;
const SUB_COMMAND_TYPE = 1;

function getOptionByName(
	options: DiscordInteractionOption[] | undefined,
	name: string,
) {
	return options?.find((option) => option.name === name);
}

function getModelFromBlacklistAddCommand(
	options: DiscordInteractionOption[] | undefined,
): string | undefined {
	const addOption = options?.find(
		(option) => option.type === SUB_COMMAND_TYPE && option.name === "add",
	);
	const modelOption = getOptionByName(addOption?.options, "model");

	if (typeof modelOption?.value !== "string") {
		return undefined;
	}

	return modelOption.value.trim();
}

function createMessageResponse(content: string) {
	return Response.json({
		type: INTERACTION_RESPONSE_TYPE_CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content,
			flags: EPHEMERAL_FLAG,
		},
	});
}

export async function action({ request }: { request: Request }) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	const rawBody = await request.text();
	const timestamp = request.headers.get("x-signature-timestamp");
	const signature = request.headers.get("x-signature-ed25519");

	const discordInteractionsService = container.get(DiscordInteractionsService);
	const isValidSignature = discordInteractionsService.verifyRequestSignature(
		rawBody,
		signature,
		timestamp,
	);

	if (!isValidSignature) {
		return new Response("Unauthorized", { status: 401 });
	}

	let interaction: DiscordInteraction;
	try {
		interaction = JSON.parse(rawBody) as DiscordInteraction;
	} catch {
		return new Response("Invalid JSON body", { status: 400 });
	}

	if (interaction.type === INTERACTION_TYPE_PING) {
		return Response.json({ type: INTERACTION_RESPONSE_TYPE_PONG });
	}

	if (
		interaction.type === INTERACTION_TYPE_APPLICATION_COMMAND &&
		interaction.data?.name === "blacklist"
	) {
		const model = getModelFromBlacklistAddCommand(interaction.data.options);

		if (!model) {
			return createMessageResponse(
				"Comando inválido. Use `/blacklist add model:<model-id>`.",
			);
		}

		const blacklistService = container.get(RedisModelBlacklistService);
		const providerSelectionService = container.get(ProviderSelectionService);

		await blacklistService.addToBlacklist(model);
		providerSelectionService.invalidateCachedModel(model);

		return createMessageResponse(`Modelo \`${model}\` adicionado à blacklist.`);
	}

	return createMessageResponse("Comando não suportado.");
}
