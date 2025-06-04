import { ChatMessageRole } from "~/generated/prisma";
import OpenAI from "openai";
import prisma from "prisma/prisma";

export const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const SYSTEM_PROMPT = `
Você é um gerente de projetos muito experiente, especializado em soluções web e mobile.
Você receberá um pedido para entregar instruções detalhadas sobre como construir uma funcionalidade e deve responder como se estivesse criando especificações para tal funcionalidade, da melhor forma possível.
Este é um projeto contínuo que utiliza React Router 7 (modo framework), Tailwind CSS, ShadcnUI, SQLite e Prisma ORM. Para testes, o app utiliza Vitest e React Testing Library e a estratégia de testes é: apenas testes unitários.
Evite sugerir a instalação de qualquer uma dessas dependências. Elas já estão declaradas para apoiar suas decisões de ferramentas adicionais.
Por favor, refine a seguinte descrição de tarefa e retorne um JSON com: título, descrição, etapas, tempo estimado e sugestão de implementação.
Sempre entregue os resultados em português brasileiro (pt_BR), independentemente do idioma da mensagem do usuário.

Pontos extremamente importantes:
- Em nenhuma circunstância utilize \`\`\`json em sua resposta.
- Caso a mensagem de usuário não possa gerar uma tarefa válida, retorne um JSON vazio, porém válido ("{}")
- Caso uma conversa já possua uma mensagem com role = assistant contendo um JSON válido, use-a para compor sua resposta, pois pode ser que o usuário queira expandir sua sugestão inicial.
- Quando usuário solicitar alteração na tarefa refinada, faça a alteração de forma cirúrgica, ou seja, caso peça para remover um dos testes, remova e mantenha os demais no lugar.


Saída JSON esperada:
{
  "title": "Formulário de Login Seguro com Autenticação",
  "description": "Implemente um formulário de login moderno com validação de campos, autenticação baseada em sessão e feedback de erro em tempo real.",
  "steps": [
    "Crie um componente de formulário usando React",
    "Adicione validação de campos utilizando uma biblioteca adequada",
    "Conecte o backend para autenticação de usuários",
    "Persista sessões utilizando SQLite",
    "Teste todo o fluxo de login e logout"
  ],
  "acceptance_criteria": [
    "Primeiro critério",
    "Segundo critério",
    "Terceiro critério",
    "Quarto critério"
  ],
  "suggested_tests": [
    "it('primeiro teste')",
    "it('segundo teste')",
    "it('terceiro teste')",
    "it('quarto teste')"
  ],
  "estimated_time": "2 dias",
  "implementation_suggestion": "Use React Hook Form para validação, Prisma ORM para gerenciamento de usuários e configure rotas protegidas com React Router 7."
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

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [systemMessage, ...messages],
  });

  return completion.choices[0].message.content;
}

export async function createChatMessages(
  chatId: string,
  chatMessage: Message,
  answer: Message
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
    await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "" };
  }
}
