export abstract class EmbeddingService {
	abstract createEmbeddingsFromMarkdown(
		markdown: string,
	): Promise<{ chunk_content: string; embedding: number[] }[]>; // TODO: remove chunk_content?
}
