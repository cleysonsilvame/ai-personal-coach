import { createCookie } from "react-router";

const SIDEBAR_COOKIE_NAME = "user-prefs";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface UserPrefsState {
	sidebarOpen?: boolean;
}

interface UserPrefs {
	parse: (cookieHeader: string | null) => Promise<UserPrefsState | null>;
	serialize: (data: UserPrefsState) => Promise<string>;
}

export const userPrefs: UserPrefs = createCookie(SIDEBAR_COOKIE_NAME, {
	maxAge: SIDEBAR_COOKIE_MAX_AGE,
	sameSite: "lax",
	path: "/",
});
