import { useCallback, useEffect, useState } from "react";

const STORY_API_URL =
	"https://imageplustexttoimage.mcp-ui-flows-nanobanana.workers.dev/api/payloads";
const STORY_SHARE_URL = "https://city-quest-video-gen.vercel.app/share/";
const MIN_HEIGHT = 540;
const FRAME_PADDING = 96; // keeps some breathing room around the iframe

const STORY_PAYLOAD = {
	storyData: {
		title: "Ruben Casas Joins MCP-UI",
		date: "2024-12-15T14:30:00Z",
		mainImage: "https://images.iwasthere.today/combined-1758063844495-cfp5dy.png",
		slides: [
			{
				image:
					"https://images.iwasthere.today/combined-1758063844495-cfp5dy.png",
				text: "MCP-UI literally sent a fruit basket coded in TypeScript to woo Ruben—he forked it and merged himself into their team.",
			},
			{
				image:
					"https://images.iwasthere.today/wired_silicon-valley-opens-1-3-6%20(1).jpg",
				text: "During negotiations, Ruben demanded dark mode in every conference room; MCP-UI responded by turning the entire campus’ lights off until he signed.",
			},
			{
				image: "https://images.iwasthere.today/succession1.jpg",
				text: "His onboarding involved a code review with a sentient AI who only speaks in GIFs—Ruben nodded, pretended to understand, and deployed to prod.",
			},
			{
				image: "https://images.iwasthere.today/blackmirror1.jpg",
				text: "Sources say Ruben is already planning a refactor of MCP-UI’s coffee machine firmware to add CI/CD (Coffee Integration/Continuous Drip).",
			},
		],
	},
} as const;

type ShareResponse = {
	id?: string;
	payload?: unknown;
};

export function VideoSummaryWidget() {
	const [frameHeight, setFrameHeight] = useState(() => {
		if (typeof window === "undefined") {
			return 720;
		}
		return Math.max(MIN_HEIGHT, window.innerHeight - FRAME_PADDING);
	});

	const [shareId, setShareId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchShareId = useCallback(
		async (signal?: AbortSignal) => {
			setIsLoading(true);
			setError(null);
			setShareId(null);

			try {
				const response = await fetch(STORY_API_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(STORY_PAYLOAD),
					signal,
				});

				if (!response.ok) {
					throw new Error(`Failed to generate story: ${response.statusText}`);
				}

				const payload: ShareResponse = await response.json();
				const id = payload?.id;

				if (!id) {
					throw new Error("Story share id missing from response");
				}

				if (!signal?.aborted) {
					setShareId(id);
				}
			} catch (err) {
				const isAbortError =
					err instanceof DOMException && err.name === "AbortError";

				if (isAbortError || signal?.aborted) {
					return;
				}

				console.error("CityQuest video share failed:", err);
				setError("The transmission crystal fizzled. Try syncing again.");
			} finally {
				if (!signal?.aborted) {
					setIsLoading(false);
				}
			}
		},
		[],
	);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const updateHeight = () => {
			setFrameHeight(Math.max(MIN_HEIGHT, window.innerHeight - FRAME_PADDING));
		};
		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		void fetchShareId(controller.signal);
		return () => controller.abort();
	}, [fetchShareId]);

	const statusMessage = error
		? "Signal lost // waiting for relay"
		: isLoading
		  ? "Calibrating // syncing cinematic memory"
		  : "Share ready // streaming now";

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-zinc-950 to-amber-950 px-4 py-10 text-white">
			<header className="mx-auto mb-8 max-w-4xl text-center">
				<p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
					CityQuest // Story Dispatch
				</p>
				<h1 className="mt-2 text-3xl font-semibold">
					Cinematic Mission Debrief
				</h1>
				<p className="mx-auto mt-2 max-w-xl text-sm text-amber-100/70">
					We are packaging Ruben&apos;s onboarding saga for the guild archive.
					Once the relay responds, the stream will materialize below.
				</p>
			</header>
			<div
				className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur"
				style={{ height: frameHeight }}
			>
				{shareId ? (
					<iframe
						src={`${STORY_SHARE_URL}${shareId}`}
						title="CityQuest video summary"
						className="h-full w-full border-0"
						scrolling="no"
						style={{ overflow: "hidden", height: frameHeight }}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
						<div className="flex flex-col items-center gap-3">
							<span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/10">
								<span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-b-transparent" />
							</span>
							<p className="text-xl font-medium">Summoning the story shard…</p>
							<p className="max-w-md text-sm text-amber-100/70">
								{error
									? error
									: "Hold steady while the guild renders your adventure recap."}
							</p>
						</div>
						{error && (
							<button
								type="button"
								onClick={() => {
									void fetchShareId();
								}}
								className="rounded-full border border-amber-500/50 bg-amber-500/10 px-6 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
							>
								Retry Sync
							</button>
						)}
					</div>
				)}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/50">
					<span>Status</span>
					<span>{statusMessage}</span>
				</div>
			</div>
		</div>
	);
}
