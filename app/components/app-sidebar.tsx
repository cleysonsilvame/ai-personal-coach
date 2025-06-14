import type * as React from "react";

import { IconDashboard, IconInnerShadowTop } from "@tabler/icons-react";
import { ListCheckIcon, MessageCircleCode, UsersIcon } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import { Link } from "react-router";

const data = {
	user: {
		name: "Cleyson Silva",
		email: "cleysonsilva@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Chats",
			url: "/chats",
			icon: MessageCircleCode,
		},
		{
			title: "Objetivos",
			url: "/goals",
			icon: ListCheckIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">
									AI Personal Coach
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			{/* <SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter> */}
		</Sidebar>
	);
}
