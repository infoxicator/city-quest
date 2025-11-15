import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { ImageTextSlide } from "./ImageTextSlide";
import { TitleSlide } from "./TitleSlide";
import { EndSlide } from "./EndSlide";
import { StoryData, VideoThemeSettings } from "../types";

interface StorySlidesProps {
  storyData: StoryData;
}

const defaultVideoTheme: VideoThemeSettings = {
  background: "#031f16",
  fallbackImageBackground: "#0d3a2b",
  imageOverlayGradient: "linear-gradient(135deg, rgba(5, 56, 38, 0.7), rgba(4, 31, 23, 0.9))",
  textureDotColor: "rgba(255,255,255,0.14)",
  textPanelBackground: "rgba(9, 74, 52, 0.92)",
  textPanelBorderColor: "rgba(255,255,255,0.2)",
  textPanelShadow: "0 30px 60px rgba(0, 0, 0, 0.45)",
  textColor: "#ffffff",
  indicatorActive: "#19c48a",
  indicatorGlow: "rgba(25, 196, 138, 0.6)",
  indicatorInactive: "rgba(255,255,255,0.3)",
  title: {
    fallbackGradient: "linear-gradient(180deg, #0b5a3d 0%, #043226 100%)",
    overlayGradient: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
    containerBackground: "linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0.2))",
    badgeBackground: "rgba(25, 196, 138, 0.18)",
    badgeBorder: "rgba(255,255,255,0.35)",
    badgeTextColor: "#ffffff",
  },
  end: {
    background: "linear-gradient(180deg, #0b5a3d 0%, #043226 100%)",
    accent: "#19c48a",
    subtitleColor: "rgba(255,255,255,0.7)",
    textColor: "#ffffff",
  },
};

export const StorySlides: React.FC<StorySlidesProps> = ({ storyData }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const theme = storyData.theme ?? defaultVideoTheme;

  const slides = storyData.slides ?? [];
  const mainImage = storyData.mainImage ?? slides[0]?.image;
  const detailSlides = slides;
  const detailCount = detailSlides.length;

  const baseTitleDuration = Math.max(90, Math.floor(storyData.title.length * 1.5));
  const gapAfterTitle = detailCount > 0 ? Math.round(fps) : 0;
  const titleDuration = baseTitleDuration + gapAfterTitle;
  const endDuration = 90;
  const remainingFrames = durationInFrames - titleDuration - endDuration;
  const safeRemainingFrames = Math.max(0, remainingFrames);
  const timingSlideCount = Math.max(detailCount, 1);
  const slideDuration = Math.floor(safeRemainingFrames / timingSlideCount);
  const slideRemainder = safeRemainingFrames % timingSlideCount;

  let sequenceOffset = titleDuration;

  return (
    <AbsoluteFill
      style={{
        background: theme.background,
        color: theme.textColor,
      }}
    >
      <Sequence durationInFrames={titleDuration}>
        <TitleSlide
          title={storyData.title}
          image={mainImage}
          theme={theme}
        />
      </Sequence>

      {detailSlides.map((slide, index) => {
        const extraFrame = index < slideRemainder ? 1 : 0;
        const durationForSlide = slideDuration + extraFrame;
        if (durationForSlide <= 0) {
          return null;
        }
        const from = sequenceOffset;
        sequenceOffset += durationForSlide;

        return (
          <Sequence key={`slide-${index}`} from={from} durationInFrames={durationForSlide}>
            <ImageTextSlide
              image={slide?.image}
              text={slide?.text}
              slideIndex={index}
              totalSlides={detailCount || 1}
              theme={theme}
            />
          </Sequence>
        );
      })}

      <Sequence from={durationInFrames - endDuration} durationInFrames={endDuration}>
        <EndSlide
          callToAction={"Create your own and share!"}
          title="Thanks for watching!"
          theme={theme}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

