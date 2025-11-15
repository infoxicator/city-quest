import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoThemeSettings } from "../types";

// Simple arrow down component matching original
const ArrowDown = ({ fill = 'black' }) => (
  <svg
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="250px"
    height="250px"
    viewBox="0 0 32 32"
  >
    <g>
      <g id="arrow_x5F_down">
        <path
          fill={fill}
          d="M32,16.016l-5.672-5.664c0,0-3.18,3.18-6.312,6.312V0h-8.023v16.664l-6.32-6.32L0,16.016L16,32
      L32,16.016z"
        />
      </g>
    </g>
  </svg>
);

// // Simple TLDR logo component matching original
// const TldrLogo = ({ fill, width = 50, style }: { fill: string; width?: number; style?: React.CSSProperties }) => (
//   <svg
//     width={width}
//     viewBox="0 0 94 71"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ ...style }}
//   >
//     <path
//       d="M88.7127 32.0317C88.4883 31.7915 86.8946 30.2 79.7178 25.0512C79.7054 25.0411 78.4546 23.9944 74.6525 20.1291C74.5984 20.0716 69.1507 14.2156 63.6331 1.1276C63.5769 0.994469 63.4735 0.88677 63.3428 0.825158C63.2121 0.763547 63.0632 0.752362 62.9247 0.79375L4.81265 18.2106C4.73038 18.2352 4.65454 18.2777 4.59048 18.3349C4.52642 18.3921 4.47571 18.4627 4.44193 18.5417C4.40814 18.6206 4.39212 18.7061 4.39498 18.7919C4.39784 18.8777 4.41953 18.9619 4.45849 19.0384L5.58525 21.2468L1.2271 22.2687C1.13941 22.2887 1.05752 22.3287 0.987848 22.3855C0.918173 22.4424 0.862595 22.5146 0.825461 22.5965C0.788328 22.6784 0.770646 22.7678 0.773795 22.8577C0.776945 22.9476 0.800842 23.0355 0.843618 23.1146L25.6188 69.8328C25.6357 69.8644 25.6616 69.8847 25.6831 69.9106C25.7067 69.9422 25.7282 69.976 25.7575 70.0009C25.7846 70.0245 25.8162 70.0369 25.8466 70.055C25.8816 70.0753 25.9143 70.099 25.9526 70.1114C25.9831 70.1215 26.0158 70.1215 26.0474 70.1272C26.0891 70.1339 26.1308 70.143 26.1737 70.1407C26.2098 70.1385 26.2436 70.1238 26.2786 70.1159C26.3136 70.1069 26.3496 70.1069 26.3835 70.0911L29.378 68.6993L30.8014 70.2242C30.8048 70.2287 30.8104 70.2298 30.8149 70.2332C30.862 70.2796 30.9165 70.3177 30.9762 70.346L31.0259 70.3685C31.0906 70.3943 31.1593 70.4084 31.2289 70.4103H31.2311L31.2334 70.4092C31.3123 70.4092 31.389 70.39 31.4624 70.3584C31.468 70.3561 31.4748 70.3573 31.4804 70.3539L90.6719 42.4804C90.7181 42.4601 91.8054 41.9875 92.3705 41.6131C92.5148 41.5262 92.8656 41.2589 93.0314 40.642C93.2491 40.1062 94.1706 37.0192 88.7127 32.0317V32.0317Z"
//       fill={fill}
//     />
//   </svg>
// );

interface EndSlideProps {
  callToAction: string;
  title?: string;
  theme: VideoThemeSettings;
}
export const EndSlide: React.FC<EndSlideProps> = ({ callToAction, theme }) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();
  
  // Split call to action into words for animation (matching original implementation)
  const text = callToAction.split(' ').map((t) => ` ${t} `);

  // Scale animation for arrow (matching original)
  const scaleIn = spring({
    frame,
    config: {
      mass: 3.5,
    },
    from: 1,
    to: 1.3,
    fps: 10,
  });

  return (
    <AbsoluteFill
      style={{
        height: '100%',
        width: '100%',
        background: theme.end.background,
        padding: `60px 90px 150px 90px`,
        color: theme.end.textColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            letterSpacing: 8,
            fontSize: 22,
            textTransform: 'uppercase',
          color: theme.end.subtitleColor,
        }}
      >
        https://tbpn-video-generator.vercel.app/
      </span>
      <div
        style={{
          height: 4,
          width: 120,
          backgroundColor: theme.end.accent,
          borderRadius: 999,
        }}
      />
      </div>
      
      {/* Animated call to action text */}
      <h1
        style={{
          fontFamily: 'SF Pro Text, Helvetica, Arial',
          fontWeight: 'bold',
          fontSize: 120,
          textAlign: 'center',
          width: '100%',
          margin: 0,
        }}
      >
        {text.map((t, i) => {
          return (
            <span
              key={i}
              style={{
                marginLeft: 10,
                marginRight: 10,
                transform: `scale(${spring({
                  fps: videoConfig.fps,
                  frame: frame - i * 5,
                  config: {
                    damping: 100,
                    stiffness: 200,
                    mass: 0.5,
                  },
                })})`,
                display: 'inline-block',
              }}
            >
              {t}
            </span>
          );
        })}
      </h1>
      
      {/* Animated arrow down */}
      <span style={{ transform: `scale(${scaleIn})` }}>
        <ArrowDown fill={theme.end.accent} />
      </span>
    </AbsoluteFill>
  );
};

