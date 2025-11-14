import { createFileRoute } from "@tanstack/react-router";

import { ScoreBoardWidget } from "@/components/ScoreBoardWidget";

export const Route = createFileRoute("/score")({
	ssr: true,
	component: ScoreBoardWidget,
});

