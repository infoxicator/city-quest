export interface SlideItem {
	image: string;
	text: string; // <=200 chars
}

export interface VideoThemeSettings {
	background: string;
	fallbackImageBackground: string;
	imageOverlayGradient: string;
	textureDotColor: string;
	textPanelBackground: string;
	textPanelBorderColor: string;
	textPanelShadow: string;
	textColor: string;
	indicatorActive: string;
	indicatorGlow: string;
	indicatorInactive: string;
	title: {
		fallbackGradient: string;
		overlayGradient: string;
		containerBackground: string;
		badgeBackground: string;
		badgeBorder: string;
		badgeTextColor: string;
	};
	end: {
		background: string;
		accent: string;
		subtitleColor: string;
		textColor: string;
	};
}

export interface StoryData {
	title: string;
	date: string;
	mainImage?: string;
	slides: SlideItem[];
	theme?: VideoThemeSettings;
}

export interface BigBadGroupProps {
	images: string[];
	aiSummary: string;
	title: string;
}

export interface ImageSlideGroupProps {
	imgs: string[];
	durationInFrames?: number;
}

export interface LogoFrameProps {
	index: number;
	img: string;
}

export interface TitleProps {
	titleText: string;
}

export interface TextSlideGroupProps {
	strings: string[];
	durationInFrames: number;
}

export interface EndFrameProps {
	callToAction: string;
}

export interface ImageTestProps {
	img: string;
	index: number;
	frames: number;
}

