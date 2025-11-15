import type { NewsGeneratorTheme } from "./types";

export const cityQuestTheme: NewsGeneratorTheme = {
  id: "city-quest",
  pageClassName: "city-quest-body min-h-screen text-white pb-16",
  panelClassName: "city-quest-panel text-white",
  heroDescriptionClassName: "text-[#fde68a]",
  helperTextClassName: "text-[#fbbf24]",
  labelClassName: "city-quest-label",
  chipClassName: "city-quest-chip",
  inputClassName: "bg-[#292524] border-[#92400e] focus:border-[#fbbf24] text-white placeholder:text-[#57534e]",
  imageModeActiveClassName: "border-[#fbbf24] bg-[#78350f] text-white active-card-style",
  imageModeInactiveClassName:
    "border-[#b45309] bg-[#292524] text-[#fde68a] hover:text-white hover:border-[#fbbf24]",
  glamourPublicHelperClassName: "text-[#fbbf24]",
  urlPreviewBorderClassName: "border-[#92400e]",
  loaderFrameClassName: "border border-[#fbbf24] shadow-[0_45px_140px_rgba(217,119,6,0.55),0_0_40px_rgba(255,215,0,0.2)]",
  loaderBackgroundClassName: "bg-gradient-to-br from-[#3b0764] via-[#7c2d12] to-[#0c0a09]",
  loaderHighlightClassName: "bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.3)_0%,rgba(217,119,6,0)_65%)]",
  playerFrameClassName: "shadow-[0_35px_110px_rgba(0,0,0,0.6),0_0_30px_rgba(255,215,0,0.15)] border border-[#92400e] portrait-frame",
  emptyFrameClassName: "border-[#b45309] bg-[#292524] portrait-frame",
  errorPanelClassName:
    "rounded-[18px] border border-[#fbbf24] bg-[#78350f] text-white text-sm px-5 py-4 shadow-[0_0_25px_rgba(251,191,36,0.35),0_0_15px_rgba(255,215,0,0.2)]",
  nerdButtonClassName:
    "city-quest-subheadline text-[11px] uppercase tracking-[0.3em] text-[#fde68a] border border-[#fbbf24] rounded-full px-4 py-2 transition-colors duration-200 hover:bg-[#78350f]",
  nerdPanelClassName:
    "w-full rounded-[18px] border border-[#92400e] bg-[#292524] p-4 shadow-[0_0_35px_rgba(124,45,18,0.35),0_0_20px_rgba(255,215,0,0.1)]",
  nerdTextClassName: "text-xs leading-6 text-[#fef3c7]",
  nerdEmbedBorderClassName: "border-[#b45309]",
  primaryButtonClassName:
    "city-quest-headline tracking-[0.22em] text-sm h-12 px-8 start-button-gradient text-[#7c2d12] border-0 disabled:bg-[#292524] disabled:text-[#57534e]",
  noDataTitleClassName: "city-quest-headline text-xl text-white",
  noDataDescriptionClassName: "mt-3 text-sm text-[#fde68a]",
  secondaryPanelClassName: "city-quest-panel-secondary text-[#fef3c7]",
  placeholderSpinnerColor: "#fbbf24",
  renderControlsAppearance: {
    buttonClassName:
      "border border-[#fbbf24] bg-[linear-gradient(90deg,rgba(124,45,18,0.92),rgba(59,7,100,0.9))] shadow-[0_0_24px_rgba(251,191,36,0.18),0_0_15px_rgba(255,215,0,0.1)] hover:border-[#fcd34d] hover:shadow-[0_0_32px_rgba(251,191,36,0.28),0_0_20px_rgba(255,215,0,0.15)]",
    contentClassName: "text-white",
    iconClassName: "h-2.5 w-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.8),0_0_8px_rgba(255,215,0,0.5)]",
    spinnerColor: "#fbbf24",
    labelClassName: "city-quest-subheadline text-xs tracking-[0.32em] uppercase",
    shareLabel: "Share this adventure",
    hoverOverlayClassName: "bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.2),rgba(0,0,0,0))]",
  },
  imageUploadAppearance: {
    dropzoneClassName: "bg-[#292524] text-white border-[#92400e]",
    dropzoneHoverClassName: "hover:border-[#fbbf24]",
    statusTextClassName: "text-[#fef3c7]",
    uploadingTextClassName: "text-[#fbbf24]",
    errorTextClassName: "text-[#f59e0b]",
    successTextClassName: "text-[#fcd34d]",
    previewBorderClassName: "border-[#b45309] portrait-frame",
  },
  video: {
    background: "#0c0a09",
    fallbackImageBackground: "#292524",
    imageOverlayGradient: "linear-gradient(135deg, rgba(59, 7, 100, 0.7), rgba(124, 45, 18, 0.9))",
    textureDotColor: "rgba(255,255,255,0.14)",
    textPanelBackground: "rgba(124, 45, 18, 0.92)",
    textPanelBorderColor: "rgba(251, 191, 36, 0.3)",
    textPanelShadow: "0 30px 60px rgba(0, 0, 0, 0.45), 0 0 30px rgba(255, 215, 0, 0.15)",
    textColor: "#ffffff",
    indicatorActive: "#fbbf24",
    indicatorGlow: "rgba(251, 191, 36, 0.6)",
    indicatorInactive: "rgba(255,255,255,0.3)",
    title: {
      fallbackGradient: "linear-gradient(180deg, #7c2d12 0%, #3b0764 100%)",
      overlayGradient: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
      containerBackground: "linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0.2))",
      badgeBackground: "rgba(251, 191, 36, 0.18)",
      badgeBorder: "rgba(255, 215, 0, 0.35)",
      badgeTextColor: "#ffffff",
    },
    end: {
      background: "linear-gradient(180deg, #7c2d12 0%, #3b0764 100%)",
      accent: "#fbbf24",
      subtitleColor: "rgba(255,255,255,0.7)",
      textColor: "#ffffff",
    },
  },
  story: {
    mainInstructions:
      "Generate an exciting adventure story summary about profile_name's quest in company. Create a high-fantasy, magical narrative with rich descriptions, dramatic moments, and a sense of wonder. The story should feel like a choose-your-own-adventure tale with vivid imagery and engaging plot points. Keep the text on each slide under 500 characters.",
    templatePic: "https://images.iwasthere.today/1758059948590-30d05235-518e-472f-b5dd-09cdeec0108d.png",
  },
  copy: {
    heroChip: "City Quest",
    heroTitle: "Begin Your Adventure",
    heroDescription:
      "Create your character, choose your destination, and embark on a magical journey. Upload a portrait and we'll craft your adventure summary video.",
    nameLabel: "Adventurer's Name",
    nameHelper: "The name of your character embarking on this quest.",
    companyLabel: "Adventure Location",
    companyHelper: "Where does your adventure take place? A city, realm, or mystical destination.",
    promptLabel: "Adventure Details (optional)",
    promptHelper: "Add specific details about your quest: type of adventure, challenges, goals, or special elements.",
    glamourLabel: "Character Portrait",
    glamourHelper: "Upload a portrait image or provide a URL to showcase your adventurer.",
    glamourPublicHelper: "Make sure the image URL is publicly accessible so we can fetch it.",
    glamourUrlPlaceholder: "https://example.com/character-portrait.png",
    namePlaceholder: "e.g. Aria the Bold",
    companyPlaceholder: "e.g. The Enchanted City of Eldoria",
    promptPlaceholder: "Optional: Describe your adventure type, challenges, or goals",
    errorPrefix: "The quest generator encountered an issue",
    emptyStateTitle: "No adventure yet",
    emptyStateDescription:
      'Fill in your adventure details and hit "Generate Adventure Video" to create your quest summary.',
    nerdToggleOpen: "For adventurers 🤓",
    nerdToggleClose: "Close the adventurer notes",
    nerdDescription:
      "City Quest runs on Remotion, Nano Banana and Cloudflare Workers. We gather your adventure story via a Postman Flow and stitch the video together in the browser before shipping it off for rendering.",
    loaderSubtitle: "✨ Crafting your magical adventure...",
    primaryButton: "Generate Adventure Video",
    missingNameCompanyError: "We need an adventurer name and location to begin your quest.",
    uploadInProgressError: "Please wait—your portrait is still being uploaded.",
    missingProfileError: "A character portrait is required—upload one or provide a URL.",
    invalidProfileUrlError: "The image URL must start with http:// or https:// so we can fetch your portrait.",
  },
};

export const themes = {
  cityQuest: cityQuestTheme,
};

export type { NewsGeneratorTheme };

