import { useMutation } from "convex/react";
import { Camera, Sparkles, Wand2, Shield, Sword } from "lucide-react";
import {
	type DragEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { getStartAdventurePrompt } from "../prompts/start-adventure";
import { getStartAdventurePrompt as getStartAdventurePromptKitze } from "../prompts/start-adventure-kitze";

import { initMcpUi, sendMcpMessage } from "../mcp-ui/utils";

import { cn } from "../lib/utils";
import { api } from "../../convex/_generated/api";

type AdventureType = "tour" | "foodie" | "race" | "kitze";

const ADVENTURE_OPTIONS: Array<{
	id: AdventureType;
	title: string;
	accent: string;
	emoji: string;
}> = [
	{
		id: "tour",
		title: "Skyline Tour",
		accent: "from-purple-600/40 to-amber-600/20 text-purple-950",
		emoji: "🧭",
	},
	{
		id: "foodie",
		title: "Mythic Foodie",
		accent: "from-amber-500/50 to-yellow-600/30 text-amber-950",
		emoji: "🍝",
	},
	{
		id: "race",
		title: "Skyway Race",
		accent: "from-stone-600/40 to-amber-700/30 text-stone-950",
		emoji: "🏁",
	},
	{
		id: "kitze",
		title: "Kitze's Junk Food Bingo",
		accent: "from-red-500/40 to-blue-600/20 text-slate-950",
		emoji: "🍔",
	},
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const HERO_TITLES = ["Explorer", "Pathfinder", "Chronicle", "Navigator"];
const HERO_SUFFIXES = ["Lumen", "Starling", "Wander", "Morrow", "Solstice"];

const generateHeroName = () => {
	const title = HERO_TITLES[Math.floor(Math.random() * HERO_TITLES.length)];
	const suffix =
		HERO_SUFFIXES[Math.floor(Math.random() * HERO_SUFFIXES.length)];
	return `${title} ${suffix}`;
};

// Cache for the game card image blob
let gameCardFileCache: Promise<File> | null = null;

const getGameCardImage = async (): Promise<File> => {
	if (!gameCardFileCache) {
		gameCardFileCache = (async () => {
			const response = await fetch(
				"https://city-quest.netlify.app/cityquest-gamecard.png",
			);
			if (!response.ok) {
				throw new Error("Failed to fetch game card image");
			}
			const blob = await response.blob();
			return new File([blob], "cityquest-gamecard.png", { type: blob.type });
		})();
	}
	return gameCardFileCache;
};


function GameLoadingCard() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 95) {
					return prev;
				}
				const newProgress = prev + Math.random() * 10;
				return newProgress;
			});
		}, 300);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative flex min-h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-600/40 bg-gradient-to-br from-amber-950/60 via-stone-900/80 to-amber-950/60 p-8 shadow-2xl">
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
				<div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
				<div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
			</div>

			{/* Floating game icons */}
			<div className="relative z-10 flex items-center justify-center gap-6 mb-6">
				<Shield className="h-8 w-8 text-amber-400 animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }} />
				<Wand2 className="h-10 w-10 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
				<Sword className="h-8 w-8 text-amber-400 animate-bounce" style={{ animationDelay: "1s", animationDuration: "2s" }} />
			</div>

			{/* Loading text */}
			<div className="relative z-10 text-center space-y-2 mb-6">
				<h3 className="text-xl font-bold text-amber-200 drop-shadow-lg">
					Forging Your Character Card
				</h3>
				<p className="text-sm text-amber-300/80">
					The guild artisans are crafting your legend...
				</p>
			</div>

			{/* Progress bar */}
			<div className="relative z-10 w-full max-w-xs">
				<div className="h-2 w-full overflow-hidden rounded-full bg-amber-900/50 border border-amber-700/30">
					<div
						className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 transition-all duration-300 ease-out shadow-lg shadow-amber-500/50"
						style={{ width: `${Math.min(progress, 95)}%` }}
					/>
				</div>
				<div className="mt-2 text-center">
					<span className="text-xs font-semibold text-amber-300">
						{Math.round(Math.min(progress, 95))}%
					</span>
				</div>
			</div>

			{/* Sparkle effects */}
			<div className="pointer-events-none absolute inset-0">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="absolute h-1 w-1 rounded-full bg-amber-400 animate-ping"
						style={{
							left: `${20 + i * 15}%`,
							top: `${30 + (i % 3) * 20}%`,
							animationDelay: `${i * 0.3}s`,
							animationDuration: "2s",
						}}
					/>
				))}
			</div>
		</div>
	);
}

export function GreetingWidget() {
	const [playerName, setPlayerName] = useState(() => generateHeroName());
	const [hasEditedName, setHasEditedName] = useState(false);
	const [selectedAdventure, setSelectedAdventure] =
		useState<AdventureType>("tour");
	const [location, setLocation] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
		"idle",
	);
	const [errorMessage, setErrorMessage] = useState("");
	const [combinedImage, setCombinedImage] = useState<string | null>(null);
	const [isCombiningImages, setIsCombiningImages] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const playerNameInputId = useId();
	const locationInputId = useId();

	const createGame = useMutation(api.games.createGame);
	const sendPrompt = useMutation(api.games.sendPrompt);

	const displayName = playerName.trim() || "Explorer";

	useEffect(() => {
		initMcpUi();
	}, []);

	useEffect(() => {
		if (!navigator.geolocation) {
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords;
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
					);
					const data = await response.json();
					const city =
						data.address?.city ||
						data.address?.town ||
						data.address?.village ||
						data.address?.county ||
						data.address?.state ||
						"";
					if (city) {
						setLocation(city);
					}
				} catch (error) {
					console.error("Error fetching location:", error);
				}
			},
			(error) => {
				console.error("Error getting geolocation:", error);
			},
		);
	}, []);

	const adventureDetails = ADVENTURE_OPTIONS.find(
		(option) => option.id === selectedAdventure,
	);

	const resetStory = useCallback(() => {
		setStatus("idle");
		setErrorMessage("");
	}, []);

	const combineImages = useCallback(
		async (avatarFile: File) => {
			setIsCombiningImages(true);
			setErrorMessage("");
			try {
				const gameCardFile = await getGameCardImage();
				const formData = new FormData();
				formData.append("image1", avatarFile);
				formData.append("image2", gameCardFile);
				formData.append(
					"prompt",
					`Take the person from the first uploaded image and place them into the headshot area of the character card in the second image. Make sure the portrait fits naturally within the empty frame or designated area of the card design.

Preserve the fantasy/Dungeons & Dragons–style aesthetic of the card.

At the bottom of the card, add the text:

Player: ${displayName}

Match the card's existing typography and color style.`,
				);

				const response = await fetch(
					"https://imageplustexttoimage.mcp-ui-flows-nanobanana.workers.dev/api/combine-images",
					{
						method: "POST",
						body: formData,
					},
				);

				if (!response.ok) {
					throw new Error("Failed to combine images");
				}

				const result = await response.json();
				if (result.success && result.imageUrl) {
					setCombinedImage(result.imageUrl);
				} else {
					throw new Error("Image combination failed");
				}
			} catch (error) {
				console.error("Error combining images:", error);
				setErrorMessage(
					error instanceof Error
						? error.message
						: "Failed to create character card. Please try again.",
				);
			} finally {
				setIsCombiningImages(false);
			}
		},
		[displayName],
	);

	useEffect(() => {
		if (avatarFile && hasEditedName) {
			void combineImages(avatarFile);
		}
	}, [displayName, avatarFile, hasEditedName, combineImages]);

	const handleFileSelection = useCallback(
		async (file?: File | null) => {
			if (!file) {
				return;
			}
			if (!file.type.startsWith("image/")) {
				setErrorMessage("Choose an image to represent your adventurer.");
				return;
			}
			if (file.size > MAX_AVATAR_SIZE) {
				setErrorMessage("Please choose an image smaller than 2 MB.");
				return;
			}
			setErrorMessage("");
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resetStory();
					void combineImages(file);
				}
			};
			reader.readAsDataURL(file);
		},
		[resetStory, combineImages],
	);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLElement>) => {
			event.preventDefault();
			setIsDragging(false);
			const file = event.dataTransfer.files?.[0];
			void handleFileSelection(file);
		},
		[handleFileSelection],
	);

	const handleStartGame = useCallback(async () => {
		if (status === "saving") {
			return;
		}
		setStatus("saving");
		setErrorMessage("");
		try {
			const locationValue = location.trim() || "London";
			console.log({displayName, selectedAdventure, location: locationValue});
			const gameId = await createGame({
				playerName: displayName,
				adventureType: selectedAdventure,
				location: locationValue,
				characterCardUrl: combinedImage ?? undefined,
			});

			// Store gameId in localStorage for use in other components
			if (typeof window !== 'undefined') {
				localStorage.setItem('cityQuestGameId', gameId);
			}

			// const response = await sendPrompt({ gameId });
			//setStory(response?.prompt ?? null);
			const prompt = selectedAdventure === 'kitze' 
				? getStartAdventurePromptKitze({ gameId, name: displayName, adventureType: selectedAdventure, location: locationValue })
				: getStartAdventurePrompt({ gameId, name: displayName, adventureType: selectedAdventure, location: locationValue });
			console.log({prompt, gameId});
			void sendMcpMessage('prompt', { prompt })
			setStatus("success");
		} catch (error) {
			console.error(error);
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Unable to start your CityQuest. Please try again.",
			);
			setStatus("error");
		}
	}, [
		combinedImage,
		createGame,
		displayName,
		location,
		selectedAdventure,
		sendPrompt,
		status,
	]);

	return (
		<div className={`min-h-[calc(100vh-5rem)] py-6 sm:py-12 text-white ${
			status === "success" && selectedAdventure === "kitze"
				? "bg-gradient-to-b from-blue-800 via-red-600 via-blue-800 to-red-700 relative overflow-hidden"
				: "bg-gradient-to-b from-purple-950 via-amber-950 to-stone-950"
		}`}>
			<div className={`mx-auto flex w-full ${status === "success" && selectedAdventure === "kitze" ? "max-w-6xl" : "max-w-4xl"} justify-center px-4 sm:px-6`}>
				<section className={`w-full ${status === "success" && selectedAdventure === "kitze" ? "max-w-5xl" : "max-w-2xl"} space-y-6 rounded-3xl border border-amber-800/20 bg-amber-950/20 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur`}>
					<div className="relative overflow-hidden rounded-3xl border border-amber-700/30 bg-gradient-to-br from-amber-600/30 via-yellow-700/20 to-stone-800/90 p-4 sm:p-6 md:p-8 shadow-inner">
						<div className="pointer-events-none absolute inset-0 opacity-60">
							<div className="absolute -top-10 -right-6 h-40 w-40 rounded-full bg-amber-400/40 blur-3xl" />
							<div className="absolute top-12 -left-10 h-32 w-32 rounded-full bg-yellow-500/30 blur-2xl animate-pulse" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.2),_transparent_55%)]" />
						</div>
						<div className="relative z-10 space-y-4 text-center">
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] text-white drop-shadow-[0_8px_30px_rgba(217,119,6,0.55)] break-words">
								CityQuest
							</h1>
						</div>
					</div>

					{status !== "success" && (
						<>
							<div className="space-y-3">
								<label
									className="text-sm font-medium text-amber-100"
									htmlFor={playerNameInputId}
								>
									What should the guild call you?
								</label>
								<input
									id={playerNameInputId}
									className="w-full rounded-2xl border border-amber-700/30 bg-amber-950/20 px-4 py-3 text-base text-white placeholder:text-amber-200/60 focus:border-amber-400 focus:outline-none"
									value={playerName}
									onFocus={() => {
										if (!hasEditedName) {
											setPlayerName("");
											setHasEditedName(true);
											resetStory();
										}
									}}
									onChange={(event) => {
										setPlayerName(event.target.value);
										setHasEditedName(true);
										resetStory();
									}}
								/>
							</div>
							<div className="space-y-3">
								<label
									className="text-sm font-medium text-amber-100"
									htmlFor={locationInputId}
								>
									Where do you want to play?
								</label>
								<input
									id={locationInputId}
									className="w-full rounded-2xl border border-amber-700/30 bg-amber-950/20 px-4 py-3 text-base text-white placeholder:text-amber-200/60 focus:border-amber-400 focus:outline-none"
									value={location}
									placeholder="i.e London, Central Park, etc."
									onChange={(event) => {
										setLocation(event.target.value);
										resetStory();
									}}
								/>
							</div>
						</>
					)}

					<div className="space-y-3">
						<div className="mx-auto max-w-md">
							{combinedImage ? (
								<div className="relative overflow-hidden rounded-2xl border-2 border-amber-600/40 bg-amber-950/30 p-2 shadow-2xl">
									<img
										src={combinedImage}
										alt="Character card"
										className="mx-auto w-full max-w-full rounded-xl object-contain shadow-lg"
									/>
									<button
										type="button"
										onClick={() => {
											setCombinedImage(null);
											setAvatarFile(null);
											resetStory();
										}}
										className="absolute top-3 right-3 rounded-full bg-amber-900/80 p-2 text-amber-200 hover:bg-amber-800/90 transition"
										title="Upload a different image"
									>
										<Camera className="h-4 w-4" />
									</button>
								</div>
							) : isCombiningImages ? (
								<GameLoadingCard />
							) : (
								<button
									type="button"
									onDragOver={(event) => {
										event.preventDefault();
										setIsDragging(true);
									}}
									onDragLeave={() => setIsDragging(false)}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
									className={cn(
										"flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-amber-700/40 bg-amber-950/30 p-6 text-center transition",
										isDragging && "border-amber-400/80 bg-amber-300/20",
									)}
								>
									<div className="rounded-full bg-amber-800/30 p-3 text-amber-100">
										<Camera className="h-6 w-6" />
									</div>
									<p className="text-sm text-amber-100">
										Drag & drop or tap to upload
									</p>
									<p className="text-xs text-amber-200/80">
										Supports live camera capture on mobile
									</p>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										capture="environment"
										className="hidden"
										onChange={(event) => {
											void handleFileSelection(event.target.files?.[0]);
											event.target.value = "";
										}}
									/>
								</button>
							)}
						</div>
					</div>

					{status === "success" && selectedAdventure === "kitze" ? (
						<div className="space-y-3">
							{/* Patriotic Background Layers */}
							<div className="absolute inset-0 overflow-hidden">
								{/* Fireworks in sky */}
								<div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-yellow-400/30 blur-3xl animate-pulse" />
								<div className="absolute top-0 right-1/4 h-40 w-40 rounded-full bg-red-500/30 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
								<div className="absolute top-10 left-1/2 h-36 w-36 rounded-full bg-blue-500/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
								
								{/* Flag stripes pattern */}
								<div className="absolute inset-0 opacity-10">
									{Array.from({ length: 13 }).map((_, i) => (
										<div
											key={i}
											className={`absolute w-full h-[calc(100%/13)] ${i % 2 === 0 ? 'bg-red-600' : 'bg-white'}`}
											style={{ top: `${(i * 100) / 13}%` }}
										/>
									))}
								</div>
								
								{/* Stars pattern overlay */}
								<div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-900/20" />
								<div className="absolute top-0 left-0 w-1/3 h-1/3 opacity-30" style={{
									backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
									backgroundSize: '20px 20px',
								}} />
							</div>

							{/* Main Content */}
							<div className="relative z-10 space-y-6 py-8">
								{/* Hero Message */}
								<div className="text-center space-y-4 px-4 py-12 overflow-visible">
									<h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] animate-bounce break-words">
										Ayyyy let's freakin' GOOOOOO 🇺🇸🍔🔥
									</h2>
									<div className="flex items-center justify-center gap-4 text-6xl animate-pulse">
										<span>🇺🇸</span>
										<span>🍔</span>
										<span>🔥</span>
									</div>
								</div>

								{/* Bingo Card */}
								<div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-red-600 p-6 sm:p-8">
									<header className="mb-6 text-center">
										<h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase flex flex-wrap items-center justify-center gap-2 sm:gap-3">
											<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 drop-shadow-sm">USA</span>
											<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 drop-shadow-sm">Junk Food</span>
											<span className="text-slate-900">Bingo</span>
										</h3>
										<div className="h-2 w-full max-w-md mx-auto bg-slate-900 mt-2 -skew-x-12 relative -top-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
									</header>

									<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
										{[
											{ name: "McDonald's", icon: "🍔" },
											{ name: "In-N-Out Burger", icon: "🌴" },
											{ name: "Shake Shack", icon: "🍔" },
											{ name: "Taco Bell", icon: "🌮" },
											{ name: "Chick-fil-A", icon: "🐔" },
											{ name: "Wendy's", icon: "👧" },
											{ name: "Burger King", icon: "👑" },
											{ name: "Popeyes", icon: "🍗" },
											{ name: "KFC", icon: "👴" },
											{ name: "Five Guys", icon: "🥜" },
											{ name: "Sonic Drive-In", icon: "🛼" },
											{ name: "Dairy Queen", icon: "🍦" },
											{ name: "Dunkin'", icon: "🍩" },
											{ name: "Baskin-Robbins", icon: "🍨" },
											{ name: "Applebee's", icon: "🍎" },
											{ name: "Red Lobster", icon: "🦞" },
											{ name: "Olive Garden", icon: "🥖" },
											{ name: "Texas Roadhouse", icon: "🥩" },
											{ name: "Cheesecake Factory", icon: "🍰" },
											{ name: "IHOP", icon: "🥞" },
											{ name: "Denny's", icon: "🍳" },
											{ name: "Waffle House", icon: "🧇" },
											{ name: "Domino's", icon: "🍕" },
											{ name: "Pizza Hut", icon: "🏠" },
											{ name: "Chipotle", icon: "🌯" },
											{ name: "Panera Bread", icon: "🥐" },
											{ name: "Subway", icon: "🥪" },
											{ name: "Jimmy John's", icon: "🥪" },
											{ name: "Arby's", icon: "🍖" },
											{ name: "Panda Express", icon: "🐼" },
											{ name: "Cracker Barrel", icon: "🪵" },
											{ name: "Chili's", icon: "🌶️" },
										].map((item) => (
											<div
												key={item.name}
												className="aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center gap-0.5 border-2 transition-all duration-300 relative overflow-hidden group bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:scale-105"
											>
												<span className="text-lg sm:text-xl drop-shadow-sm flex-shrink-0 leading-none">
													{item.icon}
												</span>
												<span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-center uppercase tracking-tighter leading-[1.1] text-slate-700 px-0.5 line-clamp-2">
													{item.name}
												</span>
											</div>
										))}
									</div>

									<div className="mt-6 text-center">
										<p className="text-lg font-bold text-slate-700 uppercase tracking-wider">
											0 / 32 Collected
										</p>
									</div>
								</div>

								{/* Decorative Elements */}
								<div className="flex items-center justify-center gap-8 text-4xl sm:text-5xl">
									<span className="animate-bounce" style={{ animationDelay: "0s" }}>🦅</span>
									<span className="animate-bounce" style={{ animationDelay: "0.2s" }}>🇺🇸</span>
									<span className="animate-bounce" style={{ animationDelay: "0.4s" }}>🍔</span>
								</div>
							</div>
						</div>
					) : status === "success" ? (
						<div className="space-y-3">
							<div className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-600/30 via-yellow-700/20 to-stone-800/90 p-6 text-center shadow-xl shadow-amber-600/40">
								<div className="flex flex-col items-center gap-3">
									<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-800/40 text-3xl">
										{adventureDetails?.emoji}
									</span>
									<div>
										<p className="text-2xl font-bold text-white">
											{adventureDetails?.title
												? `Enjoy your ${adventureDetails.title} Adventure!`
												: "Enjoy your Adventure!"}
										</p>
										<p className="mt-2 text-sm text-amber-100/90">
											Follow your guide's instructions below!
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{ADVENTURE_OPTIONS.map((option) => {
									const isActive = option.id === selectedAdventure;
									return (
										<button
											key={option.id}
											type="button"
											onClick={() => {
												setSelectedAdventure(option.id);
												resetStory();
											}}
											className={cn(
												"group relative overflow-hidden rounded-3xl border-2 px-5 py-6 text-center md:text-left transition hover:-translate-y-1 hover:border-amber-400",
												isActive
													? "border-amber-400 bg-amber-900/30 shadow-xl shadow-amber-600/40"
													: "border-amber-800/20 bg-amber-950/20",
											)}
										>
											<div
												className={`absolute inset-0 opacity-70 blur-xl transition group-hover:opacity-90 ${option.accent}`}
											>
												&nbsp;
											</div>
											<div className="relative z-10 flex flex-col items-center md:items-start gap-3">
												<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-800/40 text-2xl">
													{option.emoji}
												</span>
												<div className="text-center md:text-left">
													<p className="text-lg font-semibold text-white">
														{option.title}
													</p>
													<p className="text-xs text-amber-100/80">
														{isActive ? "Selected" : "Tap to begin"}
													</p>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{errorMessage && (
						<p className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200">
							{errorMessage}
						</p>
					)}

					{status !== "success" && (
						<button
							type="button"
							onClick={() => void handleStartGame()}
							disabled={status === "saving"}
							className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4 text-lg font-bold text-amber-950 shadow-lg shadow-amber-900/50 transition hover:from-amber-400 hover:to-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
						>
							<Sparkles className="h-5 w-5" />
							{status === "saving" ? "Gathering Guild Scrolls..." : "Start Game"}
						</button>
					)}
				</section>
			</div>
		</div>
	);
}
