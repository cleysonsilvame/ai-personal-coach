import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

import { Outlet } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { CopilotHeader } from "./copilot-header";
import "./copilot-kit.css";

export default function () {
	return (
		<CopilotKit runtimeUrl="/api/copilotkit">
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					<div className="flex flex-1 flex-col">
						<div className="@container/main flex flex-1 flex-col gap-2">
							<Outlet />
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>

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
