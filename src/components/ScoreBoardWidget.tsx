import { useMutation, useQuery } from "convex/react";
import { Award, Coins, Sparkles, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useWidgetProps, useWidgetInput } from "../hooks";
import { sendMcpMessage } from "../mcp-ui/utils";

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


export function ScoreBoardWidget() {
	const updateProgress = useMutation(api.games.updatePlayerProgress);
	
	// Get toolInput and toolOutput using hooks
	const toolInput = useWidgetInput<{ gameId?: string; adventureType?: string; level?: number; gold?: number; badge?: string }>();
	const toolOutput = useWidgetProps<ScoreBoardData>(fallbackData);
	
	const [data, setData] = useState<ScoreBoardData>(toolOutput);
	const hasProcessedToolInput = useRef<string | null>(null);
	const lastMutationResult = useRef<ScoreBoardData | null>(null);

	// Get gameId from toolInput
	const gameId = toolInput?.gameId as Id<"games"> | undefined;

	console.log('[ScoreBoardWidget] toolInput:', toolInput);
	console.log('[ScoreBoardWidget] gameId:', gameId);
	console.log('[ScoreBoardWidget] toolOutput:', toolOutput);

	// Fetch current progress from Convex (will refetch after mutation)
	const progress = useQuery(
		api.games.getPlayerProgress,
		gameId ? { gameId } : "skip"
	);

	console.log('[ScoreBoardWidget] progress from query:', progress);

	// Handle toolInput updates - update database when toolInput is received
	useEffect(() => {
		console.log('[ScoreBoardWidget] toolInput effect triggered', { toolInput, gameId });
		
		if (!toolInput || !gameId) {
			console.log('[ScoreBoardWidget] No toolInput or gameId, resetting');
			hasProcessedToolInput.current = null;
			return;
		}

		// Create a signature for this toolInput to avoid duplicate processing
		const inputSignature = JSON.stringify({
			gameId,
			level: toolInput.level,
			gold: toolInput.gold,
			badge: toolInput.badge,
		});

		console.log('[ScoreBoardWidget] Input signature:', inputSignature);
		console.log('[ScoreBoardWidget] Previously processed:', hasProcessedToolInput.current);

		// Skip if we've already processed this exact input
		if (hasProcessedToolInput.current === inputSignature) {
			console.log('[ScoreBoardWidget] Already processed this input, skipping');
			return;
		}

		// Check if there are any updates to apply
		const hasUpdates = toolInput.level !== undefined || toolInput.gold !== undefined || toolInput.badge;
		
		console.log('[ScoreBoardWidget] Has updates:', hasUpdates, {
			level: toolInput.level,
			gold: toolInput.gold,
			badge: toolInput.badge,
		});
		
		if (hasUpdates) {
			hasProcessedToolInput.current = inputSignature;
			console.log('[ScoreBoardWidget] Calling updateProgress mutation with:', {
				gameId,
				level: toolInput.level,
				gold: toolInput.gold,
				badge: toolInput.badge,
			});
			
			// Update database - this will create or update the record
			updateProgress({
				gameId,
				level: toolInput.level,
				gold: toolInput.gold,
				badge: toolInput.badge,
			})
				.then((updatedProgress) => {
					console.log('[ScoreBoardWidget] Mutation successful, updated progress:', updatedProgress);
					// Store mutation result
					const mutationData = {
						playerName: updatedProgress.playerName,
						level: updatedProgress.level,
						gold: updatedProgress.gold,
						badges: updatedProgress.badges,
						updatedAt: new Date().toISOString(),
					};
					lastMutationResult.current = mutationData;
					// Update local state immediately with the mutation result
					// This ensures we display the final result right after the update
					setData(mutationData);
					console.log('[ScoreBoardWidget] Local state updated with mutation result:', mutationData);
				})
				.catch((error) => {
					console.error('[ScoreBoardWidget] Failed to update progress:', error);
					hasProcessedToolInput.current = null;
				});
		} else {
			console.log('[ScoreBoardWidget] No updates to apply');
		}
	}, [toolInput, gameId, updateProgress]);

	// Update local data when progress is fetched (after mutation completes and query refetches)
	// This ensures we always display the latest data from the database
	useEffect(() => {
		console.log('[ScoreBoardWidget] Progress effect triggered', { progress, toolOutput, gameId, lastMutationResult: lastMutationResult.current });
		
		if (progress) {
			// Only update from query if we don't have a recent mutation result
			// This prevents the query from overriding the mutation result
			const progressData = {
				playerName: progress.playerName,
				level: progress.level,
				gold: progress.gold,
				badges: progress.badges,
				updatedAt: new Date().toISOString(),
			};
			
			// Check if query result matches mutation result (to avoid unnecessary updates)
			const mutationMatches = lastMutationResult.current && 
				lastMutationResult.current.level === progressData.level &&
				lastMutationResult.current.gold === progressData.gold &&
				JSON.stringify(lastMutationResult.current.badges) === JSON.stringify(progressData.badges);
			
			if (!mutationMatches) {
				console.log('[ScoreBoardWidget] Setting data from progress query:', progressData);
				setData(progressData);
			} else {
				console.log('[ScoreBoardWidget] Query result matches mutation result, keeping mutation result');
			}
		} else if (toolOutput && !gameId) {
			// Only use toolOutput if we don't have a gameId (fallback for non-database mode)
			console.log('[ScoreBoardWidget] Setting data from toolOutput (no gameId):', toolOutput);
			setData(toolOutput);
		} else if (gameId && !progress) {
			// If we have a gameId but no progress, show fallback or last mutation result
			if (lastMutationResult.current) {
				console.log('[ScoreBoardWidget] gameId exists but no progress yet, using last mutation result');
				setData(lastMutationResult.current);
			} else {
				console.log('[ScoreBoardWidget] gameId exists but no progress yet, showing fallback');
				setData(fallbackData);
			}
		}
	}, [progress, toolOutput, gameId]);


	const level = typeof data.level === "number" && !Number.isNaN(data.level) ? data.level : 0;
	const gold = typeof data.gold === "number" && !Number.isNaN(data.gold) ? data.gold : 0;
	const badges = Array.isArray(data.badges) ? data.badges : [];
	const timestamp = data.updatedAt
		? new Date(data.updatedAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
		  })
		: "--:--";

	console.log('[ScoreBoardWidget] Current displayed data:', { level, gold, badges, playerName: data.playerName });

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

					<section className="rounded-2xl border border-amber-800/20 bg-amber-950/30 p-5 relative overflow-hidden">
						<div className="absolute inset-0 opacity-10">
							<div className="absolute top-0 right-1/3 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl animate-pulse" style={{ animationDelay: "0.8s" }} />
						</div>
						<div className="relative z-10">
							<button
								type="button"
								onClick={() => {
									void sendMcpMessage('prompt', {
										prompt: "the user is ready for a challenge or a question about the place they are currently. also offer to go to the next location or ask if they want to hear interesting facts and trivia about the place"
									});
								}}
								className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4 text-lg font-bold text-amber-950 shadow-lg shadow-amber-900/50 transition hover:from-amber-400 hover:to-yellow-500"
							>
								<Sparkles className="h-5 w-5" />
								<span>Continue with Adventure</span>
							</button>
						</div>
					</section>
				</section>
			</div>
		</div>
	);
}

