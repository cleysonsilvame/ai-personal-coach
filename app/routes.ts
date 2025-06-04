import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/layout.tsx", [
    index("routes/dashboard.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("chats", "routes/chats.tsx"),
    route("race-cond", "routes/race-cond.tsx"),
    route("task/new", "routes/task-new.tsx"),
    route("task/edit/:id", "routes/task-edit.tsx"),
    route("task/view/:id", "routes/task-view.tsx"),
  ]),
  route("api/chat", "routes/api.chat.ts"),
  route("copilotkit", "routes/copilotkit.ts"),
] satisfies RouteConfig;
