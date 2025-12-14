import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const isProduction = process.env.NODE_ENV === "production";

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "theme",
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secrets: ["s3cr3t"],
		// Set domain and secure only if in production
		...(isProduction ? { domain: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL, secure: true } : {}),
	},
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
