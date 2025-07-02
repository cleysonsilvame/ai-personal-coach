import { copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
import { container } from "~/lib/container";
import { CopilotKitService } from "~/services/copilot-kit.server";

export async function action({ request }: { request: Request }) {
	const { runtime, serviceAdapter } = container
		.get(CopilotKitService)
		.execute();

	const handler = copilotRuntimeNodeHttpEndpoint({
		endpoint: "/api/copilotkit",
		runtime: runtime,
		serviceAdapter: serviceAdapter,
	});
	return handler(request);
}
