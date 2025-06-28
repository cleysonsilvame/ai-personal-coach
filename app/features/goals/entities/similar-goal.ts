interface SimilarGoalProps {
	id: string;
	title: string;
	description: string;
	similarity: number;
}

export class SimilarGoal {
	id: string;
	title: string;
	description: string;
	similarity: number;

	constructor(props: SimilarGoalProps) {
		this.id = props.id;
		this.title = props.title;
		this.description = props.description;
		this.similarity = props.similarity;
	}
}
