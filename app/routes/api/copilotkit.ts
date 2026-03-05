import { copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
import { container } from "~/lib/container";
import { CopilotKitService } from "~/services/copilot-kit.server";

export async function action({ request }: { request: Request }) {
	const copilotKitService = container.get(CopilotKitService);
	const { runtime, serviceAdapter } = await copilotKitService.execute();

	const handler = copilotRuntimeNodeHttpEndpoint({
		endpoint: "/api/copilotkit",
		runtime: runtime,
		serviceAdapter: serviceAdapter,
	});
	return handler(request);
}
