import "dotenv/config";
import { randomUUID } from "node:crypto";
import { container } from "~/lib/container";
import { DrizzleClient } from "~/lib/drizzle-client";
import { chatMessagesTable, chatsTable } from "../drizzle/schema";

const { client } = container.get(DrizzleClient);

const seeds = [
	{
		title: "Plano de Aprender Inglês",
		userMessage: "Quero aprender inglês, por onde começo?",
		assistantMessage: {
			message:
				"Refinei seu objetivo de aprender inglês com um plano estruturado. O que acha dessa abordagem?",
			short_title: "Plano de Inglês",
			data: {
				title: "Desenvolver Fluência em Inglês",
				description:
					"Estabelecer um plano estruturado para alcançar fluência em inglês através de prática diária, imersão cultural e uso de ferramentas variadas de aprendizado.",
				estimated_time: "12-18 meses",
				action_steps: [
					"Avaliar nível atual através de teste de proficiência",
					"Estabelecer rotina diária de 30 minutos de estudo",
					"Inscrever-se em curso online estruturado",
					"Praticar conversação semanal com falantes nativos",
					"Consumir mídia em inglês (filmes, podcasts, livros)",
					"Fazer avaliações mensais de progresso",
				],
				progress_indicators: [
					"Conseguir manter conversação de 10 minutos sem pausas",
					"Compreender 80% de um filme sem legendas",
					"Ler um livro completo em inglês",
					"Obter pontuação específica em teste oficial (ex: TOEFL 100+)",
				],
				suggested_habits: [
					"Estudar inglês 30 minutos toda manhã",
					"Mudar idioma do celular para inglês",
					"Escrever diário pessoal em inglês",
					"Assistir notícias em inglês durante café da manhã",
				],
				motivation_strategies:
					"Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês (viagens, trabalho internacional).",
			},
		},
	},
	{
		title: "Melhorar Saúde Física",
		userMessage: "Quero melhorar minha saúde física, pode me ajudar?",
		assistantMessage: {
			message:
				"Aqui está um plano personalizado para melhorar sua saúde física!",
			short_title: "Saúde Física",
			data: {
				title: "Plano de Saúde Física",
				description:
					"Implementar hábitos saudáveis de alimentação, exercícios regulares e acompanhamento médico para melhorar a saúde física.",
				estimated_time: "6-12 meses",
				action_steps: [
					"Agendar consulta médica para check-up",
					"Iniciar caminhada diária de 30 minutos",
					"Reduzir consumo de açúcar e ultraprocessados",
					"Adicionar vegetais em todas as refeições",
					"Registrar progresso semanalmente",
				],
				progress_indicators: [
					"Perder 5% do peso corporal em 3 meses",
					"Aumentar resistência física (ex: subir escadas sem cansaço)",
					"Melhorar exames laboratoriais",
					"Manter rotina de exercícios por 3 meses consecutivos",
				],
				suggested_habits: [
					"Beber 2L de água por dia",
					"Dormir 7-8 horas por noite",
					"Preparar refeições em casa",
					"Praticar alongamento ao acordar",
				],
				motivation_strategies:
					"Definir metas mensais, celebrar pequenas conquistas, buscar apoio de amigos/família, visualizar benefícios futuros.",
			},
		},
	},
	{
		title: "Organização do Tempo",
		userMessage: "Como posso organizar melhor meu tempo?",
		assistantMessage: {
			message:
				"Veja um plano para organizar melhor seu tempo e aumentar sua produtividade!",
			short_title: "Gestão do Tempo",
			data: {
				title: "Gestão Eficiente do Tempo",
				description:
					"Adotar técnicas de organização e priorização para otimizar o uso do tempo e reduzir o estresse.",
				estimated_time: "3-6 meses",
				action_steps: [
					"Listar tarefas diárias e semanais",
					"Priorizar atividades importantes",
					"Utilizar técnicas como Pomodoro ou GTD",
					"Reservar tempo para lazer e descanso",
					"Revisar agenda semanalmente",
				],
				progress_indicators: [
					"Reduzir atrasos em compromissos",
					"Completar 80% das tarefas planejadas",
					"Sentir-se menos sobrecarregado",
					"Ter tempo livre para lazer semanalmente",
				],
				suggested_habits: [
					"Planejar o dia na noite anterior",
					"Revisar metas toda semana",
					"Evitar multitarefa",
					"Fazer pausas regulares durante o trabalho",
				],
				motivation_strategies:
					"Acompanhar progresso em aplicativos, recompensar-se por metas cumpridas, compartilhar objetivos com alguém de confiança.",
			},
		},
	},
];

for (const seed of seeds) {
	const chatId = randomUUID();
	const now = new Date();
	await client.insert(chatsTable).values({
		id: chatId,
		title: seed.title,
		created_at: now,
		updated_at: now,
	});

	const userMsgId = randomUUID();
	const assistantMsgId = randomUUID();
	await client.insert(chatMessagesTable).values([
		{
			id: userMsgId,
			content: { message: seed.userMessage },
			role: "user",
			created_at: now,
			updated_at: now,
			chat_id: chatId,
		},
		{
			id: assistantMsgId,
			content: seed.assistantMessage,
			role: "assistant",
			created_at: now,
			updated_at: now,
			chat_id: chatId,
		},
	]);
}

console.log("✅ Chats e mensagens populados com sucesso!");
