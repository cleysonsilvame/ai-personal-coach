import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useLocation } from "react-router";
import { ThemeToggle } from "~/components/theme-toggle";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/chats": "Chats",
  "/users": "Users",
  "/task/new": "Nova Task",
  "/task/edit": "Editar Task",
};

export function SiteHeader() {
  const location = useLocation();

  const getPageTitle = () => {
    // Check if we're on a dynamic route first
    if (location.pathname.startsWith("/task/edit/")) {
      return "Edit Task";
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
