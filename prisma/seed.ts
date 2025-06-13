import { faker } from "@faker-js/faker";
import { prisma } from "../app/lib/prisma-client";

// Objetivos pessoais realistas para o seed
const personalGoals = [
	{
		title: "Desenvolver Fluência em Inglês",
		description:
			"Alcançar fluência conversacional em inglês para oportunidades profissionais e viagens internacionais.",
		estimated_time: "12-18 meses",
		action_steps: [
			"Avaliar nível atual através de teste de proficiência",
			"Estabelecer rotina diária de 30 minutos de estudo",
			"Inscrever-se em curso online estruturado",
			"Praticar conversação semanal com falantes nativos",
			"Consumir mídia em inglês (filmes, podcasts, livros)",
		],
		progress_indicators: [
			"Conseguir manter conversação de 10 minutos sem pausas",
			"Compreender 80% de um filme sem legendas",
			"Ler um livro completo em inglês",
			"Obter pontuação TOEFL 100+",
		],
		suggested_habits: [
			"Estudar inglês 30 minutos toda manhã",
			"Mudar idioma do celular para inglês",
			"Escrever diário pessoal em inglês",
			"Assistir notícias em inglês durante café",
		],
		motivation_strategies:
			"Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês.",
		assistant_message:
			"Entendi seu objetivo de aprender inglês! Refinei sua meta com um plano estruturado e hábitos específicos. O que acha desses passos?",
	},
	{
		title: "Melhorar Condicionamento Físico e Saúde",
		description:
			"Estabelecer rotina de exercícios consistente para melhorar saúde cardiovascular, força e bem-estar geral.",
		estimated_time: "6-12 meses",
		action_steps: [
			"Consultar médico para avaliação física inicial",
			"Criar plano de exercícios progressivo",
			"Estabelecer rotina de 4x por semana",
			"Ajustar alimentação para suportar objetivos",
			"Acompanhar progresso com métricas semanais",
		],
		progress_indicators: [
			"Correr 5km sem parar",
			"Perder 10kg de forma saudável",
			"Fazer 50 flexões consecutivas",
			"Melhorar exames de sangue",
		],
		suggested_habits: [
			"Exercitar-se às 6h da manhã",
			"Preparar refeições saudáveis no domingo",
			"Caminhar 10.000 passos diários",
			"Dormir 8 horas por noite",
		],
		motivation_strategies:
			"Usar aplicativo de tracking, tirar fotos de progresso, definir recompensas por metas atingidas, encontrar parceiro de treino.",
		assistant_message:
			"Ótimo objetivo de saúde! Estruturei um plano progressivo que começa com avaliação médica e evolui para hábitos sustentáveis. Vamos começar?",
	},
	{
		title: "Desenvolver Habilidades de Programação",
		description:
			"Aprender desenvolvimento web moderno para transição de carreira ou melhoria profissional.",
		estimated_time: "8-12 meses",
		action_steps: [
			"Escolher stack tecnológica (React, Node.js)",
			"Completar curso estruturado online",
			"Construir 3 projetos práticos",
			"Contribuir para projetos open source",
			"Preparar portfólio profissional",
		],
		progress_indicators: [
			"Completar primeiro projeto full-stack",
			"Fazer deploy de aplicação em produção",
			"Conseguir primeira entrevista técnica",
			"Receber feedback positivo em code review",
		],
		suggested_habits: [
			"Programar 2 horas diárias",
			"Resolver 1 problema de algoritmo por dia",
			"Ler documentação técnica semanalmente",
			"Participar de comunidades de desenvolvedores",
		],
		motivation_strategies:
			"Acompanhar progresso em GitHub, celebrar pequenas vitórias, encontrar mentor, visualizar nova carreira.",
		assistant_message:
			"Excelente escolha para desenvolvimento de carreira! Criei um roadmap prático com projetos reais e métricas claras de progresso. Que tal começar hoje?",
	},
];

// Mensagens de assistente que seguem o formato JSON do sistema
const assistantResponses = [
	{
		message:
			"Entendi seu objetivo de aprender inglês! Refinei sua meta com alguns passos e sugestões. Que tal?",
		data: {
			title: "Desenvolver Fluência em Inglês através de Prática Estruturada",
			description:
				"Estabelecer um plano estruturado para alcançar fluência em inglês através de prática diária, imersão cultural e uso de ferramentas variadas de aprendizado.",
			estimated_time: "12-18 meses",
			action_steps: [
				"Avaliar nível atual através de teste de proficiência",
				"Estabelecer rotina diária de 30 minutos de estudo",
				"Inscrever-se em curso online estruturado",
				"Praticar conversação semanal com falantes nativos",
				"Consumir mídia em inglês (filmes, podcasts, livros)",
			],
			progress_indicators: [
				"Conseguir manter conversação de 10 minutos sem pausas",
				"Compreender 80% de um filme sem legendas",
				"Ler um livro completo em inglês",
				"Obter pontuação TOEFL 100+",
			],
			suggested_habits: [
				"Estudar inglês 30 minutos toda manhã",
				"Mudar idioma do celular para inglês",
				"Escrever diário pessoal em inglês",
				"Assistir notícias em inglês durante café",
			],
			motivation_strategies:
				"Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês.",
		},
	},
	{
		message:
			"Perfeito! Estruturei um plano completo de saúde e fitness. Vamos começar com uma avaliação médica e evoluir gradualmente!",
		data: {
			title: "Estabelecer Rotina de Exercícios e Alimentação Saudável",
			description:
				"Criar um estilo de vida ativo e nutritivo que promova saúde física e mental a longo prazo.",
			estimated_time: "6-12 meses",
			action_steps: [
				"Fazer check-up médico completo",
				"Definir metas específicas de condicionamento",
				"Criar cronograma semanal de exercícios",
				"Planejar cardápio semanal balanceado",
				"Estabelecer rotina de acompanhamento",
			],
			progress_indicators: [
				"Perder 8-12kg de forma saudável",
				"Conseguir correr 5km continuamente",
				"Melhorar exames laboratoriais",
				"Sentir mais energia no dia a dia",
			],
			suggested_habits: [
				"Treinar 4x por semana no mesmo horário",
				"Preparar refeições saudáveis no domingo",
				"Caminhar pelo menos 8.000 passos diários",
				"Dormir 7-8 horas por noite",
			],
			motivation_strategies:
				"Tirar fotos de progresso mensais, usar aplicativo de tracking, definir recompensas por metas, encontrar parceiro de treino.",
		},
	},
	{
		message:
			"Que legal seu interesse em programação! Poderia me contar mais sobre seu objetivo? Por exemplo, que tipo de desenvolvimento te interessa mais?",
	},
	{
		message:
			"Entendi que você quer melhorar seus hábitos. Isso é ótimo! Poderia especificar quais áreas da sua vida você gostaria de focar?",
	},
	{
		message:
			"Organizar objetivos de vida é muito importante! Que tal começarmos identificando suas principais áreas de interesse? Carreira, saúde, relacionamentos?",
	},
];

async function main() {
	// Limpar dados existentes
	await prisma.chatMessage.deleteMany();
	await prisma.chat.deleteMany();
	await prisma.goal.deleteMany();

	console.log("🧹 Dados anteriores removidos...");

	// Criar chats com conversas sobre objetivos pessoais
	const chats = [];
	for (let i = 0; i < 10; i++) {
		const chat = await prisma.chat.create({
			data: {
				title: faker.helpers.arrayElement([
					"Discussão sobre aprendizado de idiomas",
					"Planejamento de metas fitness",
					"Conversa sobre desenvolvimento de carreira",
					"Objetivos de desenvolvimento pessoal",
					"Refinamento de metas de vida",
				]),
			},
		});
		chats.push(chat);
	}

	console.log("💬 10 chats criados...");

	// Criar mensagens de chat realistas
	for (const chat of chats) {
		// Mensagem inicial do usuário
		const userMessage = await prisma.chatMessage.create({
			data: {
				content: JSON.stringify({
					message: faker.helpers.arrayElement([
						"Quero aprender inglês fluente para conseguir um emprego melhor",
						"Preciso melhorar minha saúde física, mas não sei por onde começar",
						"Gostaria de aprender programação para mudar de carreira",
						"Quero desenvolver melhor disciplina e hábitos saudáveis",
						"Preciso organizar melhor meus objetivos de vida",
					]),
				}),
				role: "user",
				chat_id: chat.id,
			},
		});

		// Resposta do coach IA - agora em formato JSON
		const assistantResponse = faker.helpers.arrayElement(assistantResponses);
		await prisma.chatMessage.create({
			data: {
				content: JSON.stringify(assistantResponse),
				role: "assistant",
				chat_id: chat.id,
			},
		});

		// Possível mensagem de follow-up
		if (faker.datatype.boolean({ probability: 0.6 })) {
			await prisma.chatMessage.create({
				data: {
					content: JSON.stringify({
						message: faker.helpers.arrayElement([
							"Isso parece muito bom! Como posso começar hoje mesmo?",
							"Quanto tempo você acha que vai levar para ver resultados?",
							"Esses hábitos parecem desafiadores, tem alguma dica?",
							"Gostei muito do plano, vou salvar esse objetivo!",
						]),
					}),
					role: "user",
					chat_id: chat.id,
				},
			});

			// Sempre responder com uma mensagem do assistente para finalizar
			await prisma.chatMessage.create({
				data: {
					content: JSON.stringify({
						message: faker.helpers.arrayElement([
							"Ótimo! Sugiro começar pelo primeiro passo hoje mesmo. Pequenas ações diárias fazem toda a diferença!",
							"Os primeiros resultados geralmente aparecem em 2-4 semanas. O importante é manter a consistência!",
							"Sim! Comece devagar e vá aumentando gradualmente. O segredo é criar o hábito primeiro, depois intensificar.",
							"Perfeito! Lembre-se: você pode sempre voltar aqui para refinar ou ajustar seu objetivo conforme evolui.",
							"Excelente atitude! Estarei aqui para te apoiar sempre que precisar. Vamos em frente!",
						]),
					}),
					role: "assistant",
					chat_id: chat.id,
				},
			});
		}
	}

	console.log("📝 Mensagens de chat criadas...");

	// Buscar todas as mensagens de chat para evitar repetição
	const allChatMessages = await prisma.chatMessage.findMany({
		where: { role: "assistant" },
	});

	// Criar apenas o número de goals que permite IDs únicos
	const maxGoals = Math.min(15, allChatMessages.length + 5); // +5 para goals sem chat_message_id

	const usedChatMessageIds = new Set<string>();

	for (let i = 0; i < maxGoals; i++) {
		const goalTemplate = faker.helpers.arrayElement(personalGoals);

		// Para evitar IDs duplicados, usar índices sequenciais quando possível
		let chatMessageId = null;
		if (
			i < allChatMessages.length &&
			faker.datatype.boolean({ probability: 0.7 }) &&
			!usedChatMessageIds.has(allChatMessages[i].id)
		) {
			chatMessageId = allChatMessages[i].id;
			usedChatMessageIds.add(chatMessageId);
		}

		await prisma.goal.create({
			data: {
				title: goalTemplate.title + (i > 2 ? ` - Versão ${i - 2}` : ""),
				description: goalTemplate.description,
				estimated_time: goalTemplate.estimated_time,
				action_steps: goalTemplate.action_steps,
				progress_indicators: goalTemplate.progress_indicators,
				suggested_habits: goalTemplate.suggested_habits,
				motivation_strategies: goalTemplate.motivation_strategies,
				chat_message_id: chatMessageId,
			},
		});
	}

	console.log(`🎯 ${maxGoals} objetivos pessoais criados...`);

	console.log("\n✅ Seed completo! Criado:");
	console.log("- 10 chats sobre desenvolvimento pessoal");
	console.log("- ~25 mensagens de coaching");
	console.log(`- ${maxGoals} objetivos pessoais estruturados`);
	console.log("\n🚀 Agora você pode testar o sistema de coaching pessoal!");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
