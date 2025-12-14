import "dotenv/config";
import { eq } from "drizzle-orm";
import { container } from "~/lib/container";
import { DrizzleClient } from "~/lib/drizzle-client";
import { GeminiEmbeddingService } from "~/services/embedding.server";
import { goalEmbeddingsTable, goalsTable } from "./schema";

async function regenerateEmbeddings() {
  const drizzleClient = container.get(DrizzleClient);
  const embeddingService = container.get(GeminiEmbeddingService);

  try {
    console.log("🔄 Iniciando regeneração de embeddings...");

    // 1. Buscar todos os goals
    const goals = await drizzleClient.client.select().from(goalsTable);

    console.log(`📊 Encontrados ${goals.length} goals para processar`);

    if (goals.length === 0) {
      console.log("✅ Nenhum goal para processar");
      return;
    }

    // 2. Deletar todos os embeddings antigos
    console.log("🗑️  Deletando embeddings antigos...");
    await drizzleClient.client.delete(goalEmbeddingsTable);

    // 3. Regenerar embeddings para cada goal
    let processed = 0;
    let errors = 0;

    for (const goal of goals) {
      try {
        console.log(`\n📝 Processando: ${goal.title}`);

        // Criar markdown do goal
        const markdown = `
# ${goal.title}

## Descrição
${goal.description}

## Tempo Estimado
${goal.estimated_time}

## Passos de Ação
${goal.action_steps.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")}

## Indicadores de Progresso
${goal.progress_indicators.map((indicator: string, i: number) => `${i + 1}. ${indicator}`).join("\n")}

## Hábitos Sugeridos
${goal.suggested_habits.map((habit: string, i: number) => `${i + 1}. ${habit}`).join("\n")}

## Estratégias de Motivação
${goal.motivation_strategies}
`;

        // Gerar novos embeddings
        const embeddings =
          await embeddingService.createEmbeddingsFromMarkdown(markdown);

        // Inserir novos embeddings
        for (const embedding of embeddings) {
          await drizzleClient.client.insert(goalEmbeddingsTable).values({
            embedding,
            goal_id: goal.id,
          });
        }

        processed++;
        console.log(
          `✅ Processado (${processed}/${goals.length}): ${goal.title}`,
        );
      } catch (error) {
        errors++;
        console.error(`❌ Erro ao processar goal ${goal.id}:`, error);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("🎉 Regeneração concluída!");
    console.log(`✅ Processados com sucesso: ${processed}`);
    console.log(`❌ Erros: ${errors}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Erro fatal durante regeneração:", error);
    process.exit(1);
  }
}

// Executar o script
regenerateEmbeddings()
  .then(() => {
    console.log("\n✨ Script finalizado com sucesso");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Falha na execução do script:", error);
    process.exit(1);
  });
