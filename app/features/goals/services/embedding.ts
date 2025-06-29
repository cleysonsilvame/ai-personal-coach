export abstract class EmbeddingService {
	abstract createEmbeddingsFromMarkdown(markdown: string): Promise<number[][]>;
	abstract createEmbeddingFromText(text: string): Promise<number[]>;
}
