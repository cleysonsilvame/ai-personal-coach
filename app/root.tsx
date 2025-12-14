import "reflect-metadata";
import "./app.css";

import {
	Links,
	type LoaderFunctionArgs,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
} from "react-router";

import clsx from "clsx";
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from "remix-themes";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import { userPrefs } from "./services/cookies.server";
import { themeSessionResolver } from "./services/sessions.server";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export const meta: Route.MetaFunction = () => [{ title: "AI Personal Coach" }];

export async function loader({ request }: LoaderFunctionArgs) {
	const { getTheme } = await themeSessionResolver(request);

	// Get sidebar state from cookie
	const cookieHeader = request.headers.get("Cookie");
	const userPrefsState = await userPrefs.parse(cookieHeader);

	return {
		theme: getTheme(),
		sidebarOpen: userPrefsState?.sidebarOpen,
	};
}

function App() {
	const data = useLoaderData<typeof loader>();
	const [theme] = useTheme();

	return (
		<html lang="en" className={clsx(theme)} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={!!data.theme} />
				<Links />
			</head>
			<body suppressHydrationWarning>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<Toaster position="top-right" />
			</body>
		</html>
	);
}

export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>();
	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction="/api/set-theme">
			<App />
		</ThemeProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
