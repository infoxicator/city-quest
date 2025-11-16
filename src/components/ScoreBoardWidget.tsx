import { useMutation, useQuery } from "convex/react";
import { Award, Coins, Sparkles, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type ScoreBoardData = {
	playerName?: string;
	level?: number;
	gold?: number;
	badges?: string[];
	updatedAt?: string;
};

const fallbackData: ScoreBoardData = {
	playerName: "Guild Runner",
	level: 0,
	gold: 0,
	badges: [],
	updatedAt: new Date().toISOString(),
};

function latestToolOutput(): ScoreBoardData | null {
	if (typeof window === "undefined") return null;
	const win = window as any;
	
	if (win.__MCP_UI_INITIAL_RENDER_DATA__?.toolOutput) {
		return win.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput as ScoreBoardData;
	}
	if (win.__MCP_UI_INITIAL_RENDER_DATA__) {
		return win.__MCP_UI_INITIAL_RENDER_DATA__ as ScoreBoardData;
	}
	if (win.openai?.toolOutput) {
		return win.openai.toolOutput as ScoreBoardData;
	}
	if (win.__MCP_WIDGET_LAST_TOOL_OUTPUT__) {
		return win.__MCP_WIDGET_LAST_TOOL_OUTPUT__ as ScoreBoardData;
	}
	return null;
}

function getToolInput() {
	if (typeof window === "undefined") return null;
	const win = window as any;
	return win.__MCP_UI_INITIAL_RENDER_DATA__?.toolInput || win.openai?.toolInput || null;
}

export function ScoreBoardWidget() {
	const updateProgress = useMutation(api.games.updatePlayerProgress);
	const [data, setData] = useState<ScoreBoardData>(() => {
		const initial = latestToolOutput();
		return { ...fallbackData, ...initial };
	});
	const hasProcessedToolInput = useRef(false);

	// Get gameId from toolInput
	const toolInput = getToolInput();
	console.log('city-quest-log:score-board', toolInput);
	const gameId = toolInput?.gameId as Id<"games"> | undefined;

	// Fetch current progress from Convex
	const progress = useQuery(
		api.games.getPlayerProgress,
		gameId ? { gameId } : "skip"
	);

	// Update local data when progress is fetched
	useEffect(() => {
		if (progress) {
			setData({
				playerName: progress.playerName,
				level: progress.level,
				gold: progress.gold,
				badges: progress.badges,
				updatedAt: new Date().toISOString(),
			});
		}
	}, [progress]);

	// Handle toolInput updates - update database when toolInput is received
	useEffect(() => {
		if (toolInput && gameId && !hasProcessedToolInput.current) {
			const hasUpdates = toolInput.level !== undefined || toolInput.gold !== undefined || toolInput.badge;
			
			if (hasUpdates) {
				hasProcessedToolInput.current = true;
				
				// Update database
				updateProgress({
					gameId,
					level: toolInput.level,
					gold: toolInput.gold,
					badge: toolInput.badge,
				}).catch((error) => {
					console.error("Failed to update progress:", error);
					hasProcessedToolInput.current = false;
				});
			}
		}

		// Reset flag when toolInput changes
		if (!toolInput || !gameId) {
			hasProcessedToolInput.current = false;
		}
	}, [toolInput?.level, toolInput?.gold, toolInput?.badge, gameId, updateProgress]);

	// Sync with toolOutput for immediate display
	useEffect(() => {
		let lastSignature = "";

		const sync = () => {
			const toolOutput = latestToolOutput();
			if (toolOutput) {
				const payload = { ...fallbackData, ...toolOutput };
				const nextSignature = JSON.stringify(payload);
				if (nextSignature !== lastSignature) {
					lastSignature = nextSignature;
					setData((prev) => ({ ...prev, ...payload }));
					if (typeof window !== "undefined") {
						(window as any).__MCP_WIDGET_LAST_TOOL_OUTPUT__ = payload;
					}
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

	const level = typeof data.level === "number" && !Number.isNaN(data.level) ? data.level : 0;
	const gold = typeof data.gold === "number" && !Number.isNaN(data.gold) ? data.gold : 0;
	const badges = Array.isArray(data.badges) ? data.badges : [];
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
					<header className="text-center relative">
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
							<div className="absolute top-0 left-1/4 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
							<div className="absolute top-0 right-1/4 h-16 w-16 rounded-full bg-yellow-500/20 blur-xl animate-pulse" style={{ animationDelay: "0.5s" }} />
						</div>
						<div className="relative z-10 flex items-center justify-center gap-2">
							<Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
							<p className="text-xs uppercase tracking-[0.35em] text-amber-100">
								CityQuest // Score Beacon
							</p>
							<Sparkles className="h-4 w-4 text-amber-300 animate-pulse" style={{ animationDelay: "0.3s" }} />
						</div>
					</header>

					<section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
						<div className="min-h-[130px] rounded-2xl border border-amber-700/30 bg-amber-900/30 p-5 flex flex-col items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 opacity-20">
								<div className="absolute top-2 right-2 h-16 w-16 rounded-full bg-amber-500/30 blur-xl animate-pulse" />
							</div>
							<div className="relative z-10 flex flex-col items-center justify-center">
								<Award className="h-6 w-6 text-amber-300 mb-2 animate-bounce" />
								<p className="text-xs uppercase tracking-[0.1em] text-amber-100 text-center">
									Quests Completed
								</p>
								<p className="mt-2 text-4xl font-bold text-white text-center flex items-center gap-1">
									{(level ?? 0).toLocaleString()}
									<Star className="h-5 w-5 text-yellow-400 animate-pulse" />
								</p>
							</div>
						</div>
						<div className="min-h-[130px] rounded-2xl border border-amber-700/30 bg-amber-900/30 p-5 flex flex-col items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 opacity-20">
								<div className="absolute top-2 left-2 h-16 w-16 rounded-full bg-yellow-500/30 blur-xl animate-pulse" style={{ animationDelay: "0.4s" }} />
							</div>
							<div className="relative z-10 flex flex-col items-center justify-center">
								<Coins className="h-6 w-6 text-yellow-400 mb-2 animate-bounce" style={{ animationDelay: "0.3s" }} />
								<p className="text-xs uppercase tracking-[0.1em] text-amber-100 text-center">
									Gold
								</p>
								<p className="mt-2 text-4xl font-bold text-yellow-400 text-center flex items-center gap-1">
									{(gold ?? 0).toLocaleString()}
									<Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" style={{ animationDelay: "0.2s" }} />
								</p>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-amber-800/20 bg-amber-950/30 p-5 relative overflow-hidden">
						<div className="absolute inset-0 opacity-10">
							<div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl animate-pulse" style={{ animationDelay: "0.6s" }} />
						</div>
						<div className="relative z-10">
							<div className="flex items-center justify-between text-sm font-medium text-amber-100 mb-4">
								<span className="flex items-center gap-2">
									<Award className="h-4 w-4 text-amber-300 animate-pulse" />
									Badges Earned
								</span>
								<time className="flex items-center gap-1">
									<Sparkles className="h-3 w-3 text-amber-200" />
									{timestamp}
								</time>
							</div>
							<div className="flex flex-wrap gap-2.5 justify-center">
								{badges.length === 0 ? (
									<span className="rounded-full border border-amber-600/40 bg-amber-800/30 px-3.5 py-2 text-xs text-amber-200 flex items-center gap-1.5">
										<Star className="h-3 w-3 text-amber-300 animate-pulse" />
										No badges yet
									</span>
								) : (
									badges.map((badge, index) => (
										<span
											key={index}
											className="rounded-full border border-amber-600/40 bg-amber-800/30 px-3.5 py-2 text-xs text-amber-200 flex items-center gap-1.5"
											style={{ animationDelay: `${index * 0.1}s` }}
										>
											<Star className="h-3 w-3 text-yellow-400 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }} />
											{badge}
										</span>
									))
								)}
							</div>
						</div>
					</section>
				</section>
			</div>
		</div>
	);
}

