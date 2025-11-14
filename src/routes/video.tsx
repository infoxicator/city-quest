import { createFileRoute } from "@tanstack/react-router";

import { VideoSummaryWidget } from "@/components/VideoSummaryWidget";

export const Route = createFileRoute("/video")({
	ssr: true,
	component: VideoSummaryWidget,
});
