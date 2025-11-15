import { useEffect, useState } from "react";

const VIDEO_URL =
	"https://tbpn-video-generator.vercel.app/share/38ddd5d5-1a0a-4027-a126-3b45bb862eff";
const MIN_HEIGHT = 540;
const FRAME_PADDING = 96; // keeps some breathing room around the iframe

export function VideoSummaryWidget() {
	const [frameHeight, setFrameHeight] = useState(() => {
		if (typeof window === "undefined") {
			return 720;
		}
		return Math.max(MIN_HEIGHT, window.innerHeight - FRAME_PADDING);
	});

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

	return (
		<div className="min-h-screen w-full bg-black px-4 py-6">
			<div
				className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
				style={{ height: frameHeight }}
			>
				<iframe
					src={VIDEO_URL}
					title="CityQuest video summary"
					className="h-full w-full border-0"
					scrolling="no"
					style={{ overflow: "hidden", height: frameHeight }}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		</div>
	);
}
