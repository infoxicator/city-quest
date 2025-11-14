import { createFileRoute } from "@tanstack/react-router";

import { GreetingWidget } from "@/components/GreetingWidget";

export const Route = createFileRoute("/greeting")({
	ssr: true,
	component: GreetingWidget,
});
