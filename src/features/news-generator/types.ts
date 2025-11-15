import type { z } from "zod";
import type { StoryResponse } from "@/components/remotion/schemata";
import type { VideoThemeSettings } from "@/components/remotion/types";

export type GeneratorLoaderData = {
  profilePic?: string | null;
  name?: string | null;
  company?: string | null;
  storyData?: z.infer<typeof StoryResponse> | null;
};

export type RenderControlsAppearance = {
  buttonClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  spinnerColor?: string;
  labelClassName?: string;
  shareLabel?: string;
  hoverOverlayClassName?: string;
};

export type ImageUploadAppearance = {
  dropzoneClassName?: string;
  dropzoneHoverClassName?: string;
  statusTextClassName?: string;
  uploadingTextClassName?: string;
  errorTextClassName?: string;
  successTextClassName?: string;
  previewBorderClassName?: string;
};

export type NewsGeneratorTheme = {
  id: string;
  pageClassName: string;
  panelClassName: string;
  heroDescriptionClassName: string;
  helperTextClassName: string;
  labelClassName: string;
  chipClassName: string;
  inputClassName: string;
  imageModeActiveClassName: string;
  imageModeInactiveClassName: string;
  glamourPublicHelperClassName: string;
  urlPreviewBorderClassName: string;
  loaderFrameClassName: string;
  loaderBackgroundClassName: string;
  loaderHighlightClassName: string;
  playerFrameClassName: string;
  emptyFrameClassName: string;
  errorPanelClassName: string;
  nerdButtonClassName: string;
  nerdPanelClassName: string;
  nerdTextClassName: string;
  nerdEmbedBorderClassName: string;
  primaryButtonClassName: string;
  noDataTitleClassName: string;
  noDataDescriptionClassName: string;
  secondaryPanelClassName: string;
  placeholderSpinnerColor: string;
  renderControlsAppearance: RenderControlsAppearance;
  imageUploadAppearance: ImageUploadAppearance;
  video: VideoThemeSettings;
  story: {
    mainInstructions: string;
    templatePic: string;
  };
  copy: {
    heroChip: string;
    heroTitle: string;
    heroDescription: string;
    nameLabel: string;
    nameHelper: string;
    companyLabel: string;
    companyHelper: string;
    promptLabel: string;
    promptHelper: string;
    glamourLabel: string;
    glamourHelper: string;
    glamourPublicHelper: string;
    glamourUrlPlaceholder: string;
    namePlaceholder: string;
    companyPlaceholder: string;
    promptPlaceholder: string;
    errorPrefix: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    nerdToggleOpen: string;
    nerdToggleClose: string;
    nerdDescription: string;
    loaderSubtitle: string;
    primaryButton: string;
    missingNameCompanyError: string;
    uploadInProgressError: string;
    missingProfileError: string;
    invalidProfileUrlError: string;
  };
};

