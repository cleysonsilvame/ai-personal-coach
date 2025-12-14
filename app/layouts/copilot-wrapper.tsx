import { useEffect, useState } from "react";

export function CopilotWrapper() {
	const [CopilotComponent, setCopilotComponent] =
		useState<React.ComponentType | null>(null);

	useEffect(() => {
		import("./.client/copilot-kit-wrapper").then((mod) => {
			setCopilotComponent(() => mod.default);
		});
	}, []);

	if (!CopilotComponent) return null;

	return <CopilotComponent />;
}
