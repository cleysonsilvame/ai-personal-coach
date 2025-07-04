import { useLocation, useRouteLoaderData } from "react-router";
import { ThemeToggle } from "~/components/theme-toggle";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import type { loader } from "~/routes/chats/new";

const ROUTE_TITLES: Record<string, string> = {
	"/chats/new": "Novo objetivo",
	"/chats": "Chats",
	"/goals": "Objetivos",
};

export function SiteHeader() {
	const location = useLocation();
	const chatsNewLoaderData =
		useRouteLoaderData<typeof loader>("routes/chats/new");

	const getPageTitle = () => {
		if (location.pathname.startsWith("/goals/edit/")) {
			return "Editar objetivo";
		}

		if (location.pathname.startsWith("/goals/view/")) {
			return "Objetivo";
		}

		if (chatsNewLoaderData?.chat_title) {
			return chatsNewLoaderData.chat_title;
		}

		return ROUTE_TITLES[location.pathname] || "Not Found";
	};

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<h1 className="text-base font-medium">{getPageTitle()}</h1>
				<div className="ml-auto flex items-center gap-2">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
