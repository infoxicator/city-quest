import { useEffect, useState } from "react";

type ScoreBoardData = {
	playerName?: string;
	score?: number;
	progressPercentage?: number;
	badges?: string[];
	lastCheckpoint?: string;
	status?: string;
	updatedAt?: string;
};

const fallbackData: ScoreBoardData = {
	playerName: "Guild Runner",
	score: 0,
	progressPercentage: 0,
	badges: ["Awaiting briefing"],
	lastCheckpoint: "No score changes reported yet.",
	status: "Standing by",
	updatedAt: new Date().toISOString(),
};

function clamp(value?: number | null): number {
	if (typeof value !== "number" || Number.isNaN(value)) return 0;
	return Math.min(100, Math.max(0, value));
}

function latestToolOutput(): ScoreBoardData | null {
	if (
		typeof window !== "undefined" &&
		window.__MCP_UI_INITIAL_RENDER_DATA__ &&
		window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput
	) {
		return window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput as ScoreBoardData;
	}
	if (
		typeof window !== "undefined" &&
		window.__MCP_UI_INITIAL_RENDER_DATA__
	) {
		return window.__MCP_UI_INITIAL_RENDER_DATA__ as ScoreBoardData;
	}
	if (
		typeof window !== "undefined" &&
		window.openai &&
		window.openai.toolOutput
	) {
		return window.openai.toolOutput as ScoreBoardData;
	}
	if (
		typeof window !== "undefined" &&
		window.__MCP_WIDGET_LAST_TOOL_OUTPUT__
	) {
		return window.__MCP_WIDGET_LAST_TOOL_OUTPUT__ as ScoreBoardData;
	}
	return null;
}

export function ScoreBoardWidget() {
	const [data, setData] = useState<ScoreBoardData>(() => {
		const initial = latestToolOutput();
		return { ...fallbackData, ...initial };
	});

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
					window.__MCP_WIDGET_LAST_TOOL_OUTPUT__ = payload;
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

	const progress = clamp(data.progressPercentage);
	const badges = Array.isArray(data.badges) ? data.badges.slice(0, 6) : [];
	const timestamp = data.updatedAt
		? new Date(data.updatedAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
		  })
		: "--:--";

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-purple-950 via-amber-950 to-stone-950 py-12 text-white">
			<div className="mx-auto flex w-full max-w-4xl justify-center px-6">
				<section className="w-full max-w-2xl space-y-6 rounded-3xl border border-amber-800/20 bg-amber-950/20 p-8 shadow-2xl backdrop-blur">
					<header>
						<p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-100">
							CityQuest // Score Beacon
						</p>
						<h1 className="m-0 text-3xl font-semibold text-white">
							{data.playerName || "Adventurer"}
						</h1>
						<p className="mt-1.5 text-sm text-amber-200/80">
							{data.lastCheckpoint || "Tracking your footsteps..."}
						</p>
					</header>

					<section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
						<div className="min-h-[130px] rounded-2xl border border-amber-700/30 bg-amber-900/30 p-5">
							<p className="text-xs uppercase tracking-[0.1em] text-amber-100">
								Total Score
							</p>
							<p className="mt-2 text-4xl font-bold text-white">
								{typeof data.score === "number"
									? data.score.toLocaleString()
									: "0"}
							</p>
						</div>
						<div className="min-h-[130px] rounded-2xl border border-amber-700/30 bg-amber-900/30 p-5">
							<p className="text-xs uppercase tracking-[0.1em] text-amber-100">
								Progress
							</p>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-900/50 border border-amber-700/30">
								<div
									className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 transition-all duration-300 ease-out shadow-lg shadow-amber-500/50"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<p className="mt-2 text-base text-amber-200/80">
								<span>{progress.toFixed(0)}</span>% synced
							</p>
						</div>
					</section>

					<section className="rounded-2xl border border-amber-800/20 bg-amber-950/30 p-5">
						<div className="flex items-center justify-between text-sm text-amber-100">
							<span>Badges + Perks</span>
							<time>{timestamp}</time>
						</div>
						<div className="mt-4 flex flex-wrap gap-2.5">
							{badges.length === 0 ? (
								<span className="rounded-full border border-amber-600/40 bg-amber-800/30 px-3.5 py-2 text-xs text-amber-200">
									No badges yet
								</span>
							) : (
								badges.map((badge, index) => (
									<span
										key={index}
										className="rounded-full border border-amber-600/40 bg-amber-800/30 px-3.5 py-2 text-xs text-amber-200"
									>
										{badge}
									</span>
								))
							)}
						</div>
					</section>

					<p className="text-sm text-amber-200/80">
						Last dispatch: <strong className="text-amber-300">{data.status || "Standing by"}</strong>
					</p>
				</section>
			</div>
		</div>
	);
}

