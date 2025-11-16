import { useMutation } from "convex/react";
import { Camera, Loader2, CheckCircle2, X, Gift, Sparkles } from "lucide-react";
import {
	type DragEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { initMcpUi } from "../mcp-ui/utils";

import { cn } from "../lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

type SelectedImage = {
	file: File;
	preview: string;
};

export function TakePictureWidget() {
	const [isDragging, setIsDragging] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [manualGameId, setManualGameId] = useState("");
	const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
	const [isClaiming, setIsClaiming] = useState(false);
	const [rewardClaimed, setRewardClaimed] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageInputId = useId();
	const gameIdInputId = useId();

	const addPicture = useMutation(api.games.addPicture);

	useEffect(() => {
		initMcpUi();
	}, []);

	const getToolInput = useCallback(() => {
		if (typeof window === 'undefined') {
			return null;
		}
		const win = window as any;
		return win.__MCP_UI_INITIAL_RENDER_DATA__?.toolInput || win.openai?.toolInput || null;
	}, []);

	const getGameId = useCallback(() => {
		// Check manual input first (for testing)
		if (manualGameId.trim()) {
			return manualGameId.trim();
		}
		if (typeof window === 'undefined') {
			return null;
		}
		// Check widget toolInput (from MCP widget args)
		const toolInput = getToolInput();
		if (toolInput?.gameId) {
			return toolInput.gameId;
		}
		// Check URL params
		const urlParams = new URLSearchParams(window.location.search);
		const gameIdFromUrl = urlParams.get('gameId');
		if (gameIdFromUrl) {
			return gameIdFromUrl;
		}
		// Fallback to localStorage
		return localStorage.getItem('cityQuestGameId');
	}, [manualGameId, getToolInput]);

	const handleFileSelection = useCallback(
		async (file?: File | null) => {
			if (!file) {
				return;
			}
			if (!file.type.startsWith("image/")) {
				setErrorMessage("Please choose an image file.");
				return;
			}
			if (file.size > MAX_IMAGE_SIZE) {
				setErrorMessage("Please choose an image smaller than 2 MB.");
				return;
			}
			if (selectedImages.length >= 3) {
				setErrorMessage("Maximum of 3 images allowed.");
				return;
			}
			setErrorMessage("");
			
			// Capture preview for display
			const previewDataUrl = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result === "string") {
						resolve(reader.result);
					} else {
						resolve("");
					}
				};
				reader.onerror = () => resolve("");
				reader.readAsDataURL(file);
			});

			// Add to selected images (not uploaded yet)
			setSelectedImages((prev) => [
				...prev,
				{ file, preview: previewDataUrl },
			]);
		},
		[selectedImages.length],
	);

	const handleClaimReward = useCallback(async () => {
		if (selectedImages.length === 0) {
			setErrorMessage("Please select at least one image to claim your reward.");
			return;
		}

		setIsClaiming(true);
		setErrorMessage("");

		try {
			// Get location and description from toolInput
			const toolInput = getToolInput();
			const location = toolInput?.location;
			const description = toolInput?.description;
			console.log('city-quest-log:take-picture', {location, description});
			const gameId = getGameId();
			if (!gameId) {
				setErrorMessage("Game ID not found. Please start a game first.");
				setIsClaiming(false);
				return;
			}

			

			// Upload all selected images
			for (const selectedImage of selectedImages) {
				// Upload image to API
				const formData = new FormData();
				formData.append('image', selectedImage.file);

				const uploadResponse = await fetch(
					'https://imageplustexttoimage.mcp-ui-flows-nanobanana.workers.dev/api/upload',
					{
						method: 'POST',
						body: formData,
					}
				);

				if (!uploadResponse.ok) {
					throw new Error('Failed to upload image');
				}

				const uploadResult = await uploadResponse.json();
				if (!uploadResult.success || !uploadResult.imageUrl) {
					throw new Error('Image upload failed');
				}

				// Save to database
				await addPicture({
					gameId: gameId as Id<'games'>,
					imageUrl: uploadResult.imageUrl,
					location,
					description,
				});
			}

			// Show success state and clear everything
			setRewardClaimed(true);
			setSelectedImages([]);
			setManualGameId("");
			setErrorMessage("");
		} catch (error) {
			console.error('Error claiming reward:', error);
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Failed to claim reward. Please try again.'
			);
		} finally {
			setIsClaiming(false);
		}
	}, [selectedImages, getGameId, getToolInput, addPicture]);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLElement>) => {
			event.preventDefault();
			setIsDragging(false);
			const files = Array.from(event.dataTransfer.files);
			// Handle multiple files
			for (const file of files) {
				if (file.type.startsWith("image/")) {
					void handleFileSelection(file);
				}
			}
		},
		[handleFileSelection],
	);

	const handleMultipleFiles = useCallback(
		(files: FileList | null) => {
			if (!files) return;
			const imageFiles = Array.from(files)
				.filter((file) => file.type.startsWith("image/"))
				.slice(0, 3 - selectedImages.length); // Only process up to the limit
			for (const file of imageFiles) {
				void handleFileSelection(file);
			}
		},
		[handleFileSelection, selectedImages.length],
	);

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-purple-950 via-amber-950 to-stone-950 py-12 text-white">
			<div className="mx-auto flex w-full max-w-4xl justify-center px-6">
				<section className="w-full max-w-2xl space-y-6 rounded-3xl border border-amber-800/20 bg-amber-950/20 p-8 shadow-2xl backdrop-blur">
					<div className="relative overflow-hidden rounded-3xl border border-amber-700/30 bg-gradient-to-br from-amber-600/30 via-yellow-700/20 to-stone-800/90 p-8 shadow-inner">
						<div className="pointer-events-none absolute inset-0 opacity-60">
							<div className="absolute -top-10 -right-6 h-40 w-40 rounded-full bg-amber-400/40 blur-3xl" />
							<div className="absolute top-12 -left-10 h-32 w-32 rounded-full bg-yellow-500/30 blur-2xl animate-pulse" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.2),_transparent_55%)]" />
						</div>
						<div className="relative z-10 space-y-4 text-center">
							<div className="flex items-center justify-center gap-3 mb-2">
								<Gift className="h-8 w-8 text-yellow-400 animate-bounce" />
								<h1 className="text-4xl font-black uppercase tracking-[0.25em] text-white drop-shadow-[0_8px_30px_rgba(217,119,6,0.55)]">
									Claim Your Reward
								</h1>
								<Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
							</div>
							<p className="text-lg font-semibold text-amber-200">
								Snap a selfie at the location to unlock your reward! 📸
							</p>
							<p className="text-sm text-amber-300/80">
								Take up to 3 pictures to document your adventure
							</p>
						</div>
					</div>

					{rewardClaimed ? (
						<div className="space-y-4">
							<div className="rounded-3xl border-2 border-green-600/60 bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-green-900/40 p-8 text-center shadow-xl shadow-green-900/40">
								<div className="flex flex-col items-center gap-4">
									<div className="rounded-full bg-green-800/40 p-4">
										<CheckCircle2 className="h-12 w-12 text-green-400" />
									</div>
									<div className="space-y-2">
										<p className="text-2xl font-bold text-green-200">
											🎉 Reward Claimed!
										</p>
										<p className="text-base text-green-300/90">
											The game master has your reward and score below
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<div className="space-y-2">
								<label
									className="text-sm font-medium text-amber-100"
									htmlFor={gameIdInputId}
								>
									Game ID (for testing)
								</label>
								<input
									id={gameIdInputId}
									type="text"
									value={manualGameId}
									onChange={(e) => setManualGameId(e.target.value)}
									placeholder="Enter game ID or leave empty to use URL/localStorage"
									className="w-full rounded-2xl border border-amber-700/30 bg-amber-950/20 px-4 py-3 text-base text-white placeholder:text-amber-200/60 focus:border-amber-400 focus:outline-none"
								/>
							</div>

							{selectedImages.length > 0 && (
							<div className="space-y-3">
								<div className="space-y-2">
									<p className="text-sm font-medium text-amber-100">
										Selected Pictures ({selectedImages.length}/3)
									</p>
									<div className="grid grid-cols-3 gap-3">
										{selectedImages.map((img, index) => (
											<div
												key={index}
												className="relative overflow-hidden rounded-xl border-2 border-amber-500/60 bg-amber-950/30 shadow-lg"
											>
												<img
													src={img.preview}
													alt={`Selected ${index + 1}`}
													className="h-32 w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => {
														setSelectedImages((prev) =>
															prev.filter((_, i) => i !== index)
														);
													}}
													disabled={isClaiming}
													className="absolute top-1 right-1 rounded-full bg-red-900/80 p-1.5 text-red-200 hover:bg-red-800/90 transition disabled:opacity-50"
													title="Remove image"
												>
													<X className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								</div>
								<button
									type="button"
									onClick={handleClaimReward}
									disabled={isClaiming || selectedImages.length === 0}
									className={cn(
										"w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 text-lg font-bold text-amber-950 shadow-lg shadow-amber-900/50 transition hover:from-yellow-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60",
									)}
								>
									{isClaiming ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											<span>Claiming Reward...</span>
										</>
									) : (
										<>
											<Gift className="h-5 w-5" />
											<span>Claim Reward</span>
											<Sparkles className="h-5 w-5" />
										</>
									)}
								</button>
							</div>
						)}

						{!isClaiming && selectedImages.length < 3 && (
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
									"flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-amber-500/60 bg-gradient-to-br from-amber-950/40 to-amber-900/20 p-8 text-center transition hover:border-amber-400 hover:from-amber-900/50 hover:to-amber-800/30",
									isDragging && "border-amber-400/80 bg-amber-300/20 scale-105",
								)}
							>
								<div className="rounded-full bg-amber-800/40 p-4 text-amber-100 shadow-lg">
									<Camera className="h-8 w-8" />
								</div>
								<div className="space-y-1">
									<p className="text-base font-semibold text-amber-100">
										📸 Snap Your Selfie
									</p>
									<p className="text-xs text-amber-200/80">
										Tap to capture or drag & drop ({selectedImages.length}/3)
									</p>
								</div>
								<input
									ref={fileInputRef}
									id={imageInputId}
									type="file"
									accept="image/*"
									capture="environment"
									multiple
									className="hidden"
									onChange={(event) => {
										handleMultipleFiles(event.target.files);
										event.target.value = "";
									}}
								/>
							</button>
							)}
						</div>
					)}

					{!rewardClaimed && errorMessage && (
						<p className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200">
							{errorMessage}
						</p>
					)}
				</section>
			</div>
		</div>
	);
}

