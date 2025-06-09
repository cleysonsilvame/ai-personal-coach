import { data, type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { userPrefs } from "~/services/cookies.server";

const sidebarActionSchema = z.object({
	open: z.boolean(),
});

export type SidebarActionSchema = z.infer<typeof sidebarActionSchema>;

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.json();
	const { open } = sidebarActionSchema.parse(formData);

	return Response.json(
		{ success: true },
		{
			headers: {
				"Set-Cookie": await userPrefs.serialize({ sidebarOpen: open }),
			},
		},
	);
}
