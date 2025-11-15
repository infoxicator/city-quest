import { Camera } from "lucide-react";
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

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function TakePictureWidget() {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageInputId = useId();

	useEffect(() => {
		initMcpUi();
	}, []);

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
			setErrorMessage("");
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					setImagePreview(reader.result);
				}
			};
			reader.readAsDataURL(file);
		},
		[],
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
							<h1 className="text-4xl font-black uppercase tracking-[0.25em] text-white drop-shadow-[0_8px_30px_rgba(217,119,6,0.55)]">
								Take Picture
							</h1>
							<p className="text-sm text-amber-200/80">
								Capture or upload an image for your adventure
							</p>
						</div>
					</div>

					<div className="space-y-3">
						{imagePreview ? (
							<div className="relative overflow-hidden rounded-2xl border-2 border-amber-600/40 bg-amber-950/30 p-2 shadow-2xl">
								<img
									src={imagePreview}
									alt="Preview"
									className="mx-auto w-full max-w-full rounded-xl object-contain shadow-lg"
								/>
								<button
									type="button"
									onClick={() => {
										setImagePreview(null);
										setImageFile(null);
										setErrorMessage("");
									}}
									className="absolute top-3 right-3 rounded-full bg-amber-900/80 p-2 text-amber-200 hover:bg-amber-800/90 transition"
									title="Take a different picture"
								>
									<Camera className="h-4 w-4" />
								</button>
							</div>
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
									id={imageInputId}
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

					{errorMessage && (
						<p className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200">
							{errorMessage}
						</p>
					)}
				</section>
			</div>
		</div>
	);
}

