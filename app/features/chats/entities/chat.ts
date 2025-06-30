export interface ChatProps {
	id: string;
	title: string;
	created_at: Date;
	updated_at: Date;
}

// TODO: verificar se os atributos devem ser camelCase ou snake_case

export class Chat {
	readonly id: string;
	readonly title: string;
	readonly created_at: Date;
	readonly updated_at: Date;

	constructor(props: ChatProps) {
		this.id = props.id;
		this.title = props.title;
		this.created_at = props.created_at;
		this.updated_at = props.updated_at;
	}

	static create(props: Omit<ChatProps, "id" | "created_at">) {
		return new Chat({
			...props,
			id: crypto.randomUUID(),
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
}
