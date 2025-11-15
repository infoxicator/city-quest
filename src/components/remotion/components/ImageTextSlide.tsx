import {
  AbsoluteFill,
  Img,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoThemeSettings } from "../types";

interface ImageTextSlideProps {
  image?: string;
  text?: string;
  slideIndex: number;
  totalSlides: number;
  theme: VideoThemeSettings;
}

export const ImageTextSlide: React.FC<ImageTextSlideProps> = ({
  image,
  text,
  slideIndex,
  totalSlides,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textLift = spring({
    frame,
    fps,
    from: 80,
    to: 0,
    config: {
      damping: 120,
      stiffness: 180,
    },
  });

  const placement = (() => {
    switch (slideIndex) {
      case 1:
        return {
          wrapper: {
            top: 120,
            bottom: "auto" as const,
            justifyContent: "flex-start" as const,
            alignItems: "flex-start" as const,
          },
          textAlign: "left" as const,
        };
      case 2:
        return {
          wrapper: {
            top: 120,
            bottom: "auto" as const,
            justifyContent: "flex-end" as const,
            alignItems: "flex-start" as const,
          },
          textAlign: "right" as const,
        };
      case 3:
        return {
          wrapper: {
            top: "50%" as const,
            left: 0,
            right: 0,
            bottom: "auto" as const,
            transform: "translateY(-50%)",
            justifyContent: "center" as const,
            alignItems: "center" as const,
          },
          textAlign: "center" as const,
          maxWidth: "70%",
        };
      default:
        return {
          wrapper: {
            justifyContent: "flex-end" as const,
            alignItems: "flex-end" as const,
          },
          textAlign: "left" as const,
        };
    }
  })();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        overflow: "hidden",
        position: "relative",
        color: theme.textColor,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <Img
            src={image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={() => {
              console.warn(`Failed to load image: ${image}`);
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: theme.fallbackImageBackground,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Overlay tint */}
      <AbsoluteFill
        style={{
          background: theme.imageOverlayGradient,
        }}
      />

      {/* Texture */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${theme.textureDotColor} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.25,
          pointerEvents: "none",
        }}
      />

      {/* Text content */}
      {text && (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 120,
            display: "flex",
            zIndex: 5,
            ...placement.wrapper,
          }}
        >
          <div
            style={{
              transform: `translateY(${textLift}px)`,
              background: theme.textPanelBackground,
              borderRadius: 36,
              padding: "48px 54px",
              maxWidth: placement.maxWidth ?? "65%",
              border: `1px solid ${theme.textPanelBorderColor}`,
              boxShadow: theme.textPanelShadow,
            }}
          >
            <p
              style={{
                fontSize: 48,
                lineHeight: 1.32,
                margin: 0,
                fontWeight: 600,
                textAlign: placement.textAlign,
                color: theme.textColor,
              }}
            >
              {text}
            </p>
          </div>
        </div>
      )}

      {/* Slide indicator */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            zIndex: 6,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={`indicator-${index}`}
              style={{
                width: 68,
                height: 6,
                backgroundColor:
                  index === slideIndex
                    ? theme.indicatorActive
                    : theme.indicatorInactive,
                borderRadius: 12,
                boxShadow:
                  index === slideIndex
                    ? `0 0 18px ${theme.indicatorGlow}`
                    : undefined,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

