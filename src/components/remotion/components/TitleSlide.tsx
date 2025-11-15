import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoThemeSettings } from "../types";

type TitleSlideProps = {
  title: string;
  image?: string;
  theme: VideoThemeSettings;
};

export const TitleSlide: React.FC<TitleSlideProps> = ({ title, image, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = title.split(" ").map((word) => ` ${word} `);
  const appearFrame = Math.round(fps * 1);
  const titleFrame = Math.max(frame - appearFrame, 0);
  const overlayOpacity = interpolate(
    frame,
    [appearFrame - 2, appearFrame + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const titleOpacity = interpolate(
    frame,
    [appearFrame, appearFrame + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const titleTranslate = interpolate(
    frame,
    [appearFrame, appearFrame + 10],
    [30, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.title.fallbackGradient,
        position: "relative",
        overflow: "hidden",
        color: theme.textColor,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
            console.warn(`Failed to load main image: ${image}`);
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          background: theme.title.overlayGradient,
          opacity: overlayOpacity,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 0 0 0",
        }}
      >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              padding: "32px 80px",
              borderRadius: 0,
              background: theme.title.containerBackground,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 18px 38px rgba(0,0,0,0.45)",
              width: "100%",
              opacity: titleOpacity,
              transform: `translateY(${titleTranslate}px)`
            }}
          >
            <span
              style={{
                letterSpacing: 6,
                textTransform: "uppercase",
                fontWeight: 700,
                fontSize: 32,
                backgroundColor: theme.title.badgeBackground,
                color: theme.title.badgeTextColor,
                padding: "12px 36px",
                borderRadius: 999,
                border: `1px solid ${theme.title.badgeBorder}`,
                boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              }}
            >
            Breaking News
          </span>

          <h1
            style={{
              margin: 0,
              fontSize: 120,
              lineHeight: 1,
              fontWeight: 900,
              textTransform: "uppercase",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              textAlign: "center",
              width: "100%",
            }}
          >
            {words.map((word, index) => {
              const wordFrame = Math.max(titleFrame - index * 5, 0);
              const scale = spring({
                frame: wordFrame,
                fps,
                config: {
                  damping: 120,
                  stiffness: 200,
                  mass: 0.4,
                },
              });

              return (
                <span
                  key={`word-${index}`}
                  style={{
                    display: "inline-block",
                    transform: `scale(${scale})`,
                    textShadow:
                      "0 14px 28px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.4)",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </h1>
        </div>
      </div>
    </AbsoluteFill>
  );
};

