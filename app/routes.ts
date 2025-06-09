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
	route("api/goals/new", "routes/api/new-goal-by-message.ts"),
	route("api/copilotkit", "routes/api/copilotkit.ts"),
	route("api/set-theme", "routes/api/set-theme.ts"),
	route("api/sidebar", "routes/api/sidebar.ts"),
] satisfies RouteConfig;
