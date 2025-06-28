import { randomUUID } from "node:crypto";

interface GoalEmbeddingProps {
	id: string;
	created_at: Date;
	updated_at: Date;
	goal_id: string;
	embedding: number[];
}

export class GoalEmbedding {
	public readonly id: string;
	public readonly created_at: Date;
	public readonly updated_at: Date;
	public readonly goal_id: string;
	public readonly embedding: number[];

	constructor(props: GoalEmbeddingProps) {
		this.id = props.id;
		this.created_at = props.created_at;
		this.updated_at = props.updated_at;
		this.goal_id = props.goal_id;
		this.embedding = props.embedding;
	}

	static create(
		props: Omit<GoalEmbeddingProps, "id" | "created_at" | "updated_at">,
	) {
		return new GoalEmbedding({
			...props,
			id: randomUUID(),
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
}
