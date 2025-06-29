export abstract class EmbeddingService {
	abstract createEmbeddingsFromMarkdown(
		markdown: string,
	): Promise<number[][]>;
	abstract createEmbeddingFromTitle(title: string): Promise<number[]>;
}
