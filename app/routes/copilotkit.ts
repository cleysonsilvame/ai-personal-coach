import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";

import { client } from "~/services/chat.server";
import { findSimilarTasks } from "~/services/task.server";

const serviceAdapter = new OpenAIAdapter({ openai: client });

const urlTemplate = `${process.env.APP_URL}/task/view/<id>`;

const runtime = new CopilotRuntime({
  actions: () => [
    {
      name: "tasksVectorSearch",
      description: `
  Quando o usuário perguntar sobre tarefas, realize uma busca vetorial para encontrá-las.
      -	O conteúdo pode não estar no título ou descrição, mas estará no corpo da tarefa.
    -	Retorne os dados completos e o link da tarefa.
  Use o seguinte template em markdown para apresentar os resultados:
  
  ### [title](${urlTemplate})
  
  > description
  
  **Tempo estimado**: estimated_time
        `,
      parameters: [
        {
          name: "content",
          type: "string",
          description: "O contexto para se fazer a busca por similaridade",
          required: true,
        },
      ],
      handler: async ({ content }) => await findSimilarTasks(content, 6, 0.2),
    },
  ],
});

export async function action({ request }: { request: Request }) {
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: "/copilotkit", // This can be ignored or used for logging
    runtime,
    serviceAdapter,
  });

  return handler(request);
}
