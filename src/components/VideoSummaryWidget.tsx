import { useEffect, useState } from "react";

type VideoSummaryData = {
	title?: string;
	summary?: string;
	videoUrl?: string;
	embedUrl?: string;
	highlights?: string[];
	callToAction?: string;
	ctaUrl?: string;
	duration?: string;
	thumbnailUrl?: string;
};

const fallbackData: VideoSummaryData = {
	title: "CityQuest Status Briefing",
	summary: "Your mission summary will appear here once the guild compiles footage.",
	videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	highlights: ["Scouting team preparing assets"],
	callToAction: "Launch video",
	ctaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	duration: "--:--",
};

function latestToolOutput(): VideoSummaryData | null {
	if (
		typeof window !== "undefined" &&
		window.__MCP_UI_INITIAL_RENDER_DATA__ &&
		window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput
	) {
		return window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput as VideoSummaryData;
	}
	if (
		typeof window !== "undefined" &&
		window.__MCP_UI_INITIAL_RENDER_DATA__
	) {
		return window.__MCP_UI_INITIAL_RENDER_DATA__ as VideoSummaryData;
	}
	if (
		typeof window !== "undefined" &&
		window.openai &&
		window.openai.toolOutput
	) {
		return window.openai.toolOutput as VideoSummaryData;
	}
	if (
		typeof window !== "undefined" &&
		window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__
	) {
		return window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__ as VideoSummaryData;
	}
	return null;
}

export function VideoSummaryWidget() {
	const [data, setData] = useState<VideoSummaryData>(() => {
		const initial = latestToolOutput();
		return { ...fallbackData, ...initial };
	});
	const [mediaType, setMediaType] = useState<"iframe" | "video" | "none">("none");

	useEffect(() => {
		let lastSignature = "";

		const sync = () => {
			const toolOutput = latestToolOutput();
			const payload = { ...fallbackData, ...toolOutput };
			const nextSignature = JSON.stringify(payload);
			if (nextSignature !== lastSignature) {
				lastSignature = nextSignature;
				setData(payload);
				if (typeof window !== "undefined") {
					window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__ = payload;
				}

				// Determine media type
				if (payload.embedUrl) {
					setMediaType("iframe");
				} else if (payload.videoUrl) {
					setMediaType("video");
				} else {
					setMediaType("none");
				}
			}
		};

		sync();
		const interval = setInterval(sync, 700);

		const handleMessage = () => sync();
		window.addEventListener("message", handleMessage);

		return () => {
			clearInterval(interval);
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	const summaryChunks = data.summary
		?.split("\n")
		.map((part) => part.trim())
		.filter(Boolean) || [];
	const highlights = Array.isArray(data.highlights)
		? data.highlights.slice(0, 8)
		: [];
	const ctaUrl = data.ctaUrl || data.videoUrl || "#";

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-purple-950 via-amber-950 to-stone-950 py-12 text-white">
			<div className="mx-auto flex w-full max-w-4xl justify-center px-6">
				<section className="w-full max-w-2xl space-y-6 rounded-3xl border border-amber-800/20 bg-amber-950/20 p-8 shadow-2xl backdrop-blur">
					<div className="relative overflow-hidden rounded-2xl border border-amber-700/30 bg-amber-950/30 pb-[56.25%]">
						{mediaType === "iframe" && data.embedUrl && (
							<iframe
								src={data.embedUrl}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								title="CityQuest briefing"
								className="absolute left-0 top-0 h-full w-full border-0"
							/>
						)}
						{mediaType === "video" && data.videoUrl && (
							<video
								src={data.videoUrl}
								poster={data.thumbnailUrl}
								controls
								playsInline
								className="absolute left-0 top-0 h-full w-full bg-black"
							/>
						)}
					</div>

					<div className="space-y-6">
						<div>
							<p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-100">
								Mission Debrief
							</p>
							<h1 className="m-0 text-3xl font-semibold text-white">{data.title}</h1>
							<div className="mt-4 flex gap-4 text-sm text-amber-200/80">
								<span>{data.duration || "--:--"}</span>
							</div>
						</div>

						<div className="summary">
							{summaryChunks.length === 0 ? (
								<p className="mb-3 text-base leading-relaxed text-amber-200/80">
									No summary provided yet.
								</p>
							) : (
								summaryChunks.map((chunk, index) => (
									<p
										key={index}
										className="mb-3 text-base leading-relaxed text-amber-200/80"
									>
										{chunk}
									</p>
								))
							)}
						</div>

						<div>
							<p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-100">
								Highlights
							</p>
							<div className="grid gap-2.5">
								{highlights.length === 0 ? (
									<div className="rounded-2xl border border-amber-700/30 bg-amber-900/30 px-4 py-3 text-sm text-amber-200/80">
										No highlights available yet.
									</div>
								) : (
									highlights.map((item, index) => (
										<div
											key={index}
											className="rounded-2xl border border-amber-700/30 bg-amber-900/30 px-4 py-3 text-sm text-amber-200/80"
										>
											{index + 1}. {item}
										</div>
									))
								)}
							</div>
						</div>

						<div>
							<a
								href={ctaUrl}
								target="_blank"
								rel="noreferrer noopener"
								className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4 text-lg font-bold text-amber-950 shadow-lg shadow-amber-900/50 transition hover:from-amber-400 hover:to-yellow-500 no-underline"
							>
								{data.callToAction || "Open briefing"}
							</a>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

