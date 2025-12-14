import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotHeader } from "./copilot-header";

import "@copilotkit/react-ui/styles.css";
import "./copilot-kit.css";

interface CopilotKitWrapperProps {
	children?: React.ReactNode;
}

export default function CopilotKitWrapper({
	children: _,
}: CopilotKitWrapperProps) {
	return (
		<CopilotKit runtimeUrl="/api/copilotkit">
			<CopilotPopup
				labels={{
					title: "Assitente de objetivos",
					initial: "Faça uma pergunta sobre os objetivos",
				}}
				Header={CopilotHeader}
			/>
		</CopilotKit>
	);
}
