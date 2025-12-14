import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { inject, injectable } from "inversify";
import OpenAI from "openai";
import { EmbeddingService } from "~/features/goals/services/embedding";
import { Config } from "~/lib/config";

@injectable()
export class GeminiEmbeddingService extends EmbeddingService {
	private readonly geminiClient: OpenAI;

	constructor(@inject(Config) private readonly config: Config) {
		super();
		this.geminiClient = new OpenAI({
			apiKey: config.env.GEMINI_API_KEY,
			baseURL: config.env.GEMINI_BASE_URL,
		});
	}

	async createEmbeddingsFromMarkdown(markdown: string): Promise<number[][]> {
		const chunks = await this.chunkMarkdownDocument(markdown);

		const embeddings = await Promise.all(
			chunks.map(async (chunk) => {
				const response = await this.geminiClient.embeddings.create({
					model: this.config.env.GEMINI_EMBEDDING_MODEL,
					input: chunk.pageContent,
				});

				return response.data[0].embedding;
			}),
		);

		return embeddings;
	}

	private async chunkMarkdownDocument(markdown: string): Promise<Document[]> {
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 2048,
			chunkOverlap: 300,
		});
		return splitter.createDocuments([markdown]);
	}

	async createEmbeddingFromText(text: string): Promise<number[]> {
		const response = await this.geminiClient.embeddings.create({
			model: this.config.env.GEMINI_EMBEDDING_MODEL,
			input: text,
		});
		return response.data[0].embedding;
	}
}
