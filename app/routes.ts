import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("layouts/layout.tsx", [
		index("routes/dashboard.tsx"),
		route("goals/new", "routes/goals/new.tsx"),
		route("goals", "routes/goals/list.tsx"),
		route("chats", "routes/chats.tsx"),
		route("task/edit/:id", "routes/task-edit.tsx"),
		route("task/view/:id", "routes/task-view.tsx"),
	]),
	route("api/chat", "routes/api.chat.ts"),
	route("copilotkit", "routes/copilotkit.ts"),
	route("action/set-theme", "routes/set-theme.ts"),
] satisfies RouteConfig;
