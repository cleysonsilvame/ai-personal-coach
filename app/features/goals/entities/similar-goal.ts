interface SimilarGoalProps {
	id: string;
	title: string;
	description: string;
	estimated_time: string;
	similarity: number;
}

export class SimilarGoal {
	id: string;
	title: string;
	description: string;
	estimated_time: string;
	similarity: number;

	constructor(props: SimilarGoalProps) {
		this.id = props.id;
		this.title = props.title;
		this.description = props.description;
		this.estimated_time = props.estimated_time;
		this.similarity = props.similarity;
	}
}
