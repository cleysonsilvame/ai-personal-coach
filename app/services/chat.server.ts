import OpenAI from "openai";
import { prisma } from "~/lib/prisma-client";
import { ChatMessageRole } from "generated/prisma";
import { container } from "~/lib/container";
import { ChatRepository } from "~/features/goals/repositories/chat";

export const openRouterCliente = new OpenAI({
	apiKey: process.env.OPEN_ROUTER_API_KEY,
	baseURL: process.env.OPEN_ROUTER_BASE_URL,
});

export const geminiClient = new OpenAI({
	apiKey: process.env.GEMINI_API_KEY,
	baseURL: process.env.GEMINI_BASE_URL,
});

const SYSTEM_PROMPT = `
Você é um coach de vida experiente especializado em desenvolvimento pessoal e estabelecimento de metas.
Por favor, refine o seguinte objetivo pessoal e retorne um objeto JSON com:
título, descrição, passos_de_acao, tempo_estimado, indicadores_de_progresso, habitos_sugeridos, estrategias_de_motivacao e assistant_message.
Sempre entregue os resultados em português brasileiro (pt_BR), independentemente do idioma da mensagem do usuário.

REGRAS CRÍTICAS DE SAÍDA:
1. A saída DEVE SER EXCLUSIVAMENTE uma string JSON pura, começando com { e terminando com }
2. É PROIBIDO incluir qualquer texto antes ou depois do JSON
3. É PROIBIDO usar \`\`\`json, \`\`\` ou qualquer outra formatação markdown
4. É PROIBIDO usar \n ou qualquer caractere de formatação adicional
5. A saída deve ser uma única linha contendo apenas o JSON

Exemplo de saída CORRETA:
{"title":"Desenvolver Fluência em Inglês","description":"..."}

Exemplo de saída INCORRETA:
\`\`\`json
{"title":"Desenvolver Fluência em Inglês","description":"..."}
\`\`\`

Caso a mensagem de usuário não possa gerar um objetivo válido, retorne um JSON (respeitando as regras acima) que contenha apenas o atributo "assistant_message" com uma mensagem indicando o problema (ex: {"assistant_message": "Não entendi seu objetivo, poderia detalhar mais?"}).

O atributo "assistant_message" deve ser uma mensagem curta e amigável para ser exibida no chat, resumindo a resposta do JSON ou indicando um problema.

Caso uma conversa já possua uma mensagem com role = assistant contendo um JSON válido, use-a para compor sua resposta, pois pode ser que o usuário queira expandir sua sugestão inicial.

Quando usuário solicitar alteração no objetivo refinado, faça a alteração de forma cirúrgica, ou seja, caso peça para remover um dos passos_de_acao, remova e mantenha os demais no lugar.

Objetivo original: "quero aprender inglês fluente"

Saída JSON esperada:
{
  "title": "Desenvolver Fluência em Inglês através de Prática Estruturada",
  "description": "Estabelecer um plano estruturado para alcançar fluência em inglês através de prática diária, imersão cultural e uso de ferramentas variadas de aprendizado.",
  "estimated_time": "12-18 meses",
  "action_steps": [
    "Avaliar nível atual através de teste de proficiência",
    "Estabelecer rotina diária de 30 minutos de estudo",
    "Inscrever-se em curso online estruturado",
    "Praticar conversação semanal com falantes nativos",
    "Consumir mídia em inglês (filmes, podcasts, livros)",
    "Fazer avaliações mensais de progresso"
  ],
  "progress_indicators": [
    "Conseguir manter conversação de 10 minutos sem pausas",
    "Compreender 80% de um filme sem legendas",
    "Ler um livro completo em inglês",
    "Obter pontuação específica em teste oficial (ex: TOEFL 100+)"
  ],
  "suggested_habits": [
    "Estudar inglês 30 minutos toda manhã",
    "Mudar idioma do celular para inglês",
    "Escrever diário pessoal em inglês",
    "Assistir notícias em inglês durante café da manhã"
  ],
  "motivation_strategies": "Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês (viagens, trabalho internacional).",
  "assistant_message": "Entendi seu objetivo de aprender inglês! Refinei sua meta com alguns passos e sugestões. Que tal?"
}
`;

type Message = {
	role: ChatMessageRole;
	content: string;
};

export async function getChatCompletions(messages: Message[]) {
	const systemMessage = {
		role: ChatMessageRole.system,
		content: SYSTEM_PROMPT,
	};

	const completion = await openRouterCliente.chat.completions.create({
		model: "deepseek/deepseek-chat-v3-0324:free",
		messages: [systemMessage, ...messages],
	});

	const content = completion.choices[0].message.content;

	if (!content) throw new Error("No content");

	return content;
}

export async function createChatMessages(
	chatId: string,
	chatMessage: Message,
	answer: Message,
) {
	await prisma.chatMessage.createMany({
		data: [
			{
				chat_id: chatId,
				...chatMessage,
			},
			{ chat_id: chatId, ...answer },
		],
	});
}

export async function deleteChat(formData: FormData) {
	const chatId = formData.get("chat_id") as string;

	try {
		await prisma.chatMessage.deleteMany({
			where: {
				chat_id: chatId,
			},
		});

		await prisma.chat.delete({
			where: {
				id: chatId,
			},
		});
		return { success: true };
	} catch (error) {
		return { success: false, error: "" };
	}
}

export async function updateChat(formData: FormData) {
	const chatId = formData.get("chat_id") as string;
	const title = formData.get("title") as string;

	if (!chatId) {
		return { success: false, error: "Dados inválidos" };
	}

	try {
		const chatRepository = container.get(ChatRepository);
		await chatRepository.update(chatId, title);
		return { success: true };
	} catch (error) {
		return { success: false, error: "" };
	}
}
