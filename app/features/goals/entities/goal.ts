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
	created_at: Date;
	updated_at: Date;
}
// TODO: camelCase or snake_case?
export class Goal {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly estimated_time: string;
	readonly action_steps: string[];
	readonly progress_indicators: string[];
	readonly suggested_habits: string[];
	readonly motivation_strategies: string;
	private _chat_message_id?: string | null;
	readonly created_at: Date;
	readonly updated_at: Date;

	constructor(props: GoalProps) {
		this.id = props.id;
		this.title = props.title;
		this.description = props.description;
		this.estimated_time = props.estimated_time;
		this.action_steps = props.action_steps;
		this.progress_indicators = props.progress_indicators;
		this.suggested_habits = props.suggested_habits;
		this.motivation_strategies = props.motivation_strategies;
		this._chat_message_id = props.chat_message_id;
		this.created_at = props.created_at;
		this.updated_at = props.updated_at;
	}

	get chat_message_id() {
		return this._chat_message_id;
	}

	removeMessageLink() {
		this._chat_message_id = null;
	}

	toMarkdown() {
		return `# ${this.title}

**Descrição:**
${this.description}

**Tempo Estimado:**
${this.estimated_time}

## Etapas de Ação
${this.action_steps && this.action_steps.length > 0 ? this.action_steps.map((step) => `- ${step}`).join("\n") : "Nenhuma"}

## Indicadores de Progresso
${
	this.progress_indicators && this.progress_indicators.length > 0
		? this.progress_indicators.map((ind) => `- ${ind}`).join("\n")
		: "Nenhum"
}

## Hábitos Sugeridos
${
	this.suggested_habits && this.suggested_habits.length > 0
		? this.suggested_habits.map((habit) => `- ${habit}`).join("\n")
		: "Nenhum"
}

## Estratégias de Motivação
${
	this.motivation_strategies
		? this.motivation_strategies
				.split("\n")
				.map((strat) => `- ${strat}`)
				.join("\n")
		: "Nenhuma"
}
		`;
	}

	static create(props: Omit<GoalProps, "id" | "created_at" | "updated_at">) {
		return new Goal({
			...props,
			id: crypto.randomUUID(),
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
}
