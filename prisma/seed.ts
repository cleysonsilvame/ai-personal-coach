import { faker } from "@faker-js/faker";
import prisma from "./prisma";

// Objetivos pessoais realistas para o seed
const personalGoals = [
  {
    title: "Desenvolver Fluência em Inglês",
    description: "Alcançar fluência conversacional em inglês para oportunidades profissionais e viagens internacionais.",
    estimated_time: "12-18 meses",
    action_steps: [
      "Avaliar nível atual através de teste de proficiência",
      "Estabelecer rotina diária de 30 minutos de estudo",
      "Inscrever-se em curso online estruturado",
      "Praticar conversação semanal com falantes nativos",
      "Consumir mídia em inglês (filmes, podcasts, livros)"
    ],
    progress_indicators: [
      "Conseguir manter conversação de 10 minutos sem pausas",
      "Compreender 80% de um filme sem legendas",
      "Ler um livro completo em inglês",
      "Obter pontuação TOEFL 100+"
    ],
    suggested_habits: [
      "Estudar inglês 30 minutos toda manhã",
      "Mudar idioma do celular para inglês",
      "Escrever diário pessoal em inglês",
      "Assistir notícias em inglês durante café"
    ],
    motivation_strategies: "Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês."
  },
  {
    title: "Melhorar Condicionamento Físico e Saúde",
    description: "Estabelecer rotina de exercícios consistente para melhorar saúde cardiovascular, força e bem-estar geral.",
    estimated_time: "6-12 meses",
    action_steps: [
      "Consultar médico para avaliação física inicial",
      "Criar plano de exercícios progressivo",
      "Estabelecer rotina de 4x por semana",
      "Ajustar alimentação para suportar objetivos",
      "Acompanhar progresso com métricas semanais"
    ],
    progress_indicators: [
      "Correr 5km sem parar",
      "Perder 10kg de forma saudável",
      "Fazer 50 flexões consecutivas",
      "Melhorar exames de sangue"
    ],
    suggested_habits: [
      "Exercitar-se às 6h da manhã",
      "Preparar refeições saudáveis no domingo",
      "Caminhar 10.000 passos diários",
      "Dormir 8 horas por noite"
    ],
    motivation_strategies: "Usar aplicativo de tracking, tirar fotos de progresso, definir recompensas por metas atingidas, encontrar parceiro de treino."
  },
  {
    title: "Desenvolver Habilidades de Programação",
    description: "Aprender desenvolvimento web moderno para transição de carreira ou melhoria profissional.",
    estimated_time: "8-12 meses",
    action_steps: [
      "Escolher stack tecnológica (React, Node.js)",
      "Completar curso estruturado online",
      "Construir 3 projetos práticos",
      "Contribuir para projetos open source",
      "Preparar portfólio profissional"
    ],
    progress_indicators: [
      "Completar primeiro projeto full-stack",
      "Fazer deploy de aplicação em produção",
      "Conseguir primeira entrevista técnica",
      "Receber feedback positivo em code review"
    ],
    suggested_habits: [
      "Programar 2 horas diárias",
      "Resolver 1 problema de algoritmo por dia",
      "Ler documentação técnica semanalmente",
      "Participar de comunidades de desenvolvedores"
    ],
    motivation_strategies: "Acompanhar progresso em GitHub, celebrar pequenas vitórias, encontrar mentor, visualizar nova carreira."
  }
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
          null // alguns chats sem título
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
        content: faker.helpers.arrayElement([
          "Quero aprender inglês fluente para conseguir um emprego melhor",
          "Preciso melhorar minha saúde física, mas não sei por onde começar",
          "Gostaria de aprender programação para mudar de carreira",
          "Quero desenvolver melhor disciplina e hábitos saudáveis",
          "Preciso organizar melhor meus objetivos de vida",
        ]),
        role: "user",
        chat_id: chat.id,
      },
    });

    // Resposta do coach IA
    await prisma.chatMessage.create({
      data: {
        content: "Excelente objetivo! Vou te ajudar a estruturar um plano detalhado para alcançar isso. Deixe-me refinar sua meta e criar um plano de ação específico com passos concretos, indicadores de progresso e estratégias de motivação.",
        role: "assistant",
        chat_id: chat.id,
      },
    });

    // Possível mensagem de follow-up
    if (faker.datatype.boolean({ probability: 0.6 })) {
      await prisma.chatMessage.create({
        data: {
          content: faker.helpers.arrayElement([
            "Isso parece muito bom! Como posso começar hoje mesmo?",
            "Quanto tempo você acha que vai levar para ver resultados?",
            "Esses hábitos parecem desafiadores, tem alguma dica?",
            "Gostei muito do plano, vou salvar esse objetivo!",
          ]),
          role: "user",
          chat_id: chat.id,
        },
      });
    }
  }

  console.log("📝 Mensagens de chat criadas...");

  for (let i = 0; i < 15; i++) {
    const goalTemplate = faker.helpers.arrayElement(personalGoals);

    await prisma.goal.create({
      data: {
        title: goalTemplate.title + (i > 2 ? ` - Versão ${i - 2}` : ''),
        description: goalTemplate.description,
        estimated_time: goalTemplate.estimated_time,
        action_steps: goalTemplate.action_steps,
        progress_indicators: goalTemplate.progress_indicators,
        suggested_habits: goalTemplate.suggested_habits,
        motivation_strategies: goalTemplate.motivation_strategies,
        chat_message_id: faker.datatype.boolean({ probability: 0.7 })
          ? faker.helpers.arrayElement(await prisma.chatMessage.findMany()).id
          : null,
      },
    });
  }

  console.log("🎯 15 objetivos pessoais criados...");

  console.log("\n✅ Seed completo! Criado:");
  console.log("- 10 chats sobre desenvolvimento pessoal");
  console.log("- ~25 mensagens de coaching");
  console.log("- 15 objetivos pessoais estruturados");
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
