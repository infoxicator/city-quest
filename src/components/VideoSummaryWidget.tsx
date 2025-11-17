import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { type LoaderData } from "./SharePlayer";
import { StoryResponse } from "./remotion/schemata";
import { useWidgetInput } from "../hooks/use-widget-input";
import { useOpenExternal } from "../hooks/use-open-external";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Play, Video } from "lucide-react";

function getBaseUrl(): string {
	if (import.meta.env.DEV) {
		return "http://localhost:3000";
	}
	return "https://city-quest.netlify.app";
}

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

export function VideoSummaryWidget() {
	const [shareId, setShareId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [loaderData, setLoaderData] = useState<LoaderData | null>(null);
	const [isLoadingShareData, setIsLoadingShareData] = useState(false);
	const openExternal = useOpenExternal();

	// Get widget input (slides array)
	const toolInput = useWidgetInput<{ slides?: Array<{ text: string }>; gameId?: string }>(undefined);
	const slidesFromInput = toolInput?.slides ?? [];

	// Get gameId from toolInput, URL params, or localStorage
	const getGameId = useCallback(() => {
		if (toolInput?.gameId) {
			return toolInput.gameId;
		}
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const gameIdFromUrl = urlParams.get("gameId");
			if (gameIdFromUrl) {
				console.log('videosummary gameid from url', gameIdFromUrl)
				return gameIdFromUrl;
			}
			return localStorage.getItem("cityQuestGameId");
		}
		return null;
	}, [toolInput]);

	const gameId = getGameId();

	// Fetch game data
	const game = useQuery(
		api.games.getGame,
		gameId ? { gameId: gameId as Id<"games"> } : "skip",
	);

	// Fetch pictures for the current game
	const pictures = useQuery(
		api.games.getPictures,
		gameId ? { gameId: gameId as Id<"games"> } : "skip",
	);

	// Check if story already exists for this gameId
	const existingStory = useQuery(
		api.games.getStoryByGameId,
		gameId ? { gameId: gameId as Id<"games"> } : "skip",
	);

	// Mutations
	const createStory = useMutation(api.games.createStory);

	// Combine slides with pictures to create StoryData format
	const combinedStoryData = useMemo(() => {
		// If we have pictures, combine them with slides
		if (pictures && pictures.length > 0) {
			const combinedSlides: Array<{ text: string; image: string }> = [];

			// Match slides with pictures by index
			const maxLength = Math.max(slidesFromInput.length, pictures.length);
			for (let i = 0; i < maxLength; i++) {
				const slideText = slidesFromInput[i]?.text ?? "";
				const pictureUrl = pictures[i]?.imageUrl ?? pictures[0]?.imageUrl ?? "";

				if (pictureUrl) {
					combinedSlides.push({
						text: slideText,
						image: pictureUrl,
					});
				}
			}

			// Filter out slides without images
			const validSlides = combinedSlides.filter((slide) => slide.image);

			if (validSlides.length > 0) {
				// Build title from game data
				const playerName = game?.playerName ?? "Adventurer";
				const adventureType = game?.adventureType ?? "tour";
				const capitalizedAdventureType = adventureType.charAt(0).toUpperCase() + adventureType.slice(1);
				const title = `${playerName} CityQuest ${capitalizedAdventureType} Adventure!`;

				// Use characterCardUrl as mainImage, fallback to first slide image
				const mainImage = game?.characterCardUrl ?? validSlides[0]?.image;

				return {
					title,
					date: new Date().toISOString(),
					mainImage,
					slides: validSlides,
				};
			}
		}

		// If we have slides but no pictures yet (still loading), return null to wait
		if (slidesFromInput.length > 0 && pictures === undefined && gameId) {
			return null;
		}

		// Otherwise, return null to use fallback
		return null;
	}, [slidesFromInput, pictures, gameId, game]);

	// Determine the story ID: use existing story if found, otherwise create new one
	useEffect(() => {
		if (!gameId) {
			// No gameId, use fallback
			setShareId("local-story");
			setIsLoading(false);
			setError(null);
			return;
		}

		// Wait for existing story query to complete
		if (existingStory === undefined) {
			setIsLoading(true);
			return;
		}

		// If story exists, use it
		if (existingStory) {
			setShareId(existingStory.id);
			setIsLoading(false);
			setError(null);
			return;
		}

		// No existing story found - wait for game data, toolInput and pictures before creating
		// Wait for game data to load
		if (game === undefined) {
			setIsLoading(true);
			return;
		}

		// Wait for pictures to load
		if (pictures === undefined) {
			setIsLoading(true);
			return;
		}

		// Wait for toolInput to be available (it might be null if not provided, but we need to check)
		// If toolInput is undefined, we're still waiting for it
		// If toolInput exists but has no slides, we should still wait a bit or use fallback
		// The key is: if we have pictures but no slidesFromInput, we shouldn't create an empty story
		
		// Wait for combinedStoryData to be ready (which requires game, pictures and slidesFromInput)
		if (combinedStoryData === null) {
			// If we have pictures but no slides from input, wait a bit more for toolInput
			if (pictures && pictures.length > 0 && slidesFromInput.length === 0) {
				// Check if toolInput is still being loaded (undefined means we haven't checked yet)
				// If toolInput is null, it means it was checked and has no slides
				// In that case, we should use fallback instead of creating empty story
				if (toolInput === undefined) {
					// Still waiting for toolInput
					setIsLoading(true);
					return;
				}
				// toolInput is available but has no slides - use fallback
				setShareId("local-story");
				setIsLoading(false);
				setError(null);
				return;
			}
			// Still waiting for game, pictures or combinedStoryData
			setIsLoading(true);
			return;
		}

		// If we have combinedStoryData but no existing story, create it
		// Only create if we have slides (combinedStoryData.slides.length > 0)
		if (combinedStoryData && !existingStory && combinedStoryData.slides.length > 0) {
			console.log('[video summary]: creating story ', combinedStoryData);
			setIsLoading(true);
			setError(null);
			createStory({
				gameId: gameId as Id<"games">,
				title: combinedStoryData.title,
				date: combinedStoryData.date,
				mainImage: combinedStoryData.mainImage,
				slides: combinedStoryData.slides,
			})
				.then((storyId) => {
					setShareId(storyId);
					setIsLoading(false);
					setError(null);
				})
				.catch((err) => {
					console.error("CityQuest video share failed:", err);
					const errorMessage = err?.message?.includes("Game not found") 
						? "Game not found. Please check the game ID."
						: "The transmission crystal fizzled. Try syncing again.";
					setError(errorMessage);
					setIsLoading(false);
				});
			return;
		}

		// Fallback: use local story (no slides or no combinedStoryData)
		setShareId("local-story");
		setIsLoading(false);
		setError(null);
	}, [gameId, existingStory, combinedStoryData, pictures, slidesFromInput.length, toolInput, game, createStory]);

	// Fetch story data from database
	const storyData = useQuery(
		api.games.getStory,
		shareId && shareId !== "local-story" ? { storyId: shareId as Id<"stories"> } : "skip",
	);

	// Process story data when it's loaded
	useEffect(() => {
		if (!shareId) {
			setLoaderData(null);
			setIsLoadingShareData(false);
			return;
		}

		// If it's a local story, use the fallback payload
		if (shareId === "local-story") {
			const parsed = StoryResponse.safeParse(STORY_PAYLOAD.storyData);
			if (parsed.success) {
				const baseUrl = getBaseUrl();
				setLoaderData({
					status: "success",
					storyData: parsed.data,
					shareId: shareId,
					shareUrl: `${baseUrl}/share/${shareId}`,
				});
			}
			setIsLoadingShareData(false);
			return;
		}

		// Wait for story data to load
		if (storyData === undefined) {
			setIsLoadingShareData(true);
			return;
		}

		setIsLoadingShareData(false);

		const baseUrl = getBaseUrl();

		if (!storyData) {
			setLoaderData({
				status: "error",
				message: "We couldn't find that adventure.",
				shareUrl: `${baseUrl}/share/${shareId}`,
			});
			return;
		}

		// Extract the story data
		const storyPayload = {
			title: storyData.title,
			date: storyData.date,
			mainImage: storyData.mainImage,
			slides: storyData.slides,
		};

		const parsed = StoryResponse.safeParse(storyPayload);

		if (!parsed.success) {
			setLoaderData({
				status: "error",
				message: "Shared story data is corrupted.",
				shareUrl: `${baseUrl}/share/${shareId}`,
			});
			return;
		}

		setLoaderData({
			status: "success",
			storyData: parsed.data,
			shareId: shareId,
			shareUrl: `${baseUrl}/share/${shareId}`,
		});
	}, [shareId, storyData]);



	const statusMessage = error
		? "Signal lost // waiting for relay"
		: isLoading || isLoadingShareData
		  ? "Calibrating // syncing cinematic memory"
		  : loaderData?.status === "error"
		    ? "Error // story data unavailable"
		    : "Share ready // streaming now";

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-purple-950 via-amber-950 to-stone-950 py-12 text-white">
			<div className="mx-auto flex w-full max-w-4xl justify-center px-6">
				<section className="w-full max-w-2xl space-y-6 rounded-3xl border border-amber-800/20 bg-amber-950/20 p-8 shadow-2xl backdrop-blur">
					<header className="text-center">
						<p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
							CityQuest // Story Dispatch
						</p>
						<h1 className="mt-2 text-3xl font-semibold">
							Cinematic Mission Debrief
						</h1>
						<p className="mx-auto mt-2 max-w-xl text-sm text-amber-100/70">
							We are packaging onboarding saga for the guild archive.
							Once the relay responds, the stream will materialize below.
						</p>
					</header>
					<div className="relative w-full">
				{loaderData && loaderData.status === "success" ? (
					<div className="flex flex-col items-center justify-center gap-6 py-20">
						<div className="relative">
							<div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
							<div className="relative flex items-center justify-center w-32 h-32 rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-sm">
								<Video className="w-16 h-16 text-amber-300 animate-pulse" />
							</div>
						</div>
						<button
							type="button"
							onClick={() => {
								if (loaderData.shareUrl) {
									openExternal(loaderData.shareUrl);
								}
							}}
							className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-400/30 overflow-hidden"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-300/20 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
							<Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
							<span>See Your Adventure Video</span>
							<div className="absolute inset-0 rounded-full border-2 border-amber-300/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
						</button>
						<p className="text-sm text-amber-200/70 mt-2">
							Your cinematic recap is ready to watch
						</p>
					</div>
				) : loaderData && loaderData.status === "error" ? (
					<div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center py-20">
						<div className="flex flex-col items-center gap-3">
							<span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-300/40 bg-red-400/10">
								<span className="text-2xl">⚠️</span>
							</span>
							<p className="text-xl font-medium">Unable to load adventure</p>
							<p className="max-w-md text-sm text-amber-100/70">
								{loaderData.message}
							</p>
						</div>
					</div>
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
									setError(null);
									setShareId(null);
									// Trigger the effect again by resetting state
									if (gameId) {
										setIsLoading(true);
									}
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
				</section>
			</div>
		</div>
	);
}
