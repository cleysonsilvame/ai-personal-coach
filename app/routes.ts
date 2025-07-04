import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("layouts/layout.tsx", [
		index("routes/dashboard.tsx"),
		route("goals", "routes/goals/list.tsx"),
		route("goals/view/:id", "routes/goals/view.tsx"),
		route("goals/edit/:id", "routes/goals/edit.tsx"),
		route("chats", "routes/chats/list.tsx"),
		route("chats/new", "routes/chats/new.tsx"),
	]),
	route("api/goals/new", "routes/api/create-goal-by-message.ts"),
	route("api/copilotkit", "routes/api/copilotkit.ts"),
	route("api/set-theme", "routes/api/set-theme.ts"),
	route("api/sidebar", "routes/api/sidebar.ts"),
] satisfies RouteConfig;
