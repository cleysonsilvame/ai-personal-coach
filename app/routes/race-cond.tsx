import { Form, useActionData, useLoaderData } from "react-router";

import { Button } from "~/components/ui/button";
import type { Route } from "./+types/race-cond";

export async function action({ request, params }: Route.ActionArgs) {
  // Simulate a delay of 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return a response after the delay
  return { success: true, timestamp: new Date().toISOString() };
}

export default function () {
  const data = useActionData<typeof action>();

  console.log(data);
  return (
    <Form method="POST">
      <Button type="submit">Clicar repetidamente!</Button>
    </Form>
  );
}
