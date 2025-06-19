interface GoalProps {
	id: string;
	title: string;
	description: string;
	estimated_time: string;
	action_steps: string[];
	progress_indicators: string[];
	suggested_habits: string[];
	motivation_strategies: string;
	chat_message_id?: string | null;
}

export class Goal {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly estimated_time: string;
	readonly action_steps: string[];
	readonly progress_indicators: string[];
	readonly suggested_habits: string[];
	readonly motivation_strategies: string;
	readonly chat_message_id?: string | null;

	constructor(props: GoalProps) {
		this.id = props.id;
		this.title = props.title;
		this.description = props.description;
		this.estimated_time = props.estimated_time;
		this.action_steps = props.action_steps;
		this.progress_indicators = props.progress_indicators;
		this.suggested_habits = props.suggested_habits;
		this.motivation_strategies = props.motivation_strategies;
		this.chat_message_id = props.chat_message_id;
	}

	static create(props: Omit<GoalProps, "id">) {
		return new Goal({
			...props,
			id: crypto.randomUUID(),
		});
	}
}
