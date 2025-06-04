import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";

export function Welcome() {
  return (
    <main className="p-12">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            This is a sample welcome card using shadcn UI components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you can add your main content.</p>
        </CardContent>
        <CardFooter>
          <Button>Get Started</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
