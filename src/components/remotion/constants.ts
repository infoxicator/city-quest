import { VERSION } from "remotion";

export const COMPOSITION_FPS = 30;
export const DURATION_IN_FRAMES = 800; // doubled total duration to give slides 2x reading time
export const COMPOSITION_WIDTH = 1080;
export const COMPOSITION_HEIGHT = 1920;
export const COMPOSITION_ID = "LogoAnimation";
export const RAM = 3008;
export const DISK = 10240;
export const TIMEOUT = 240;
export const SITE_NAME = "remotion-react-router-example-" + VERSION;

/**
 * Use autocomplete to get a list of available regions.
 * @type {import('@remotion/lambda').AwsRegion}
 */
export const REGION = "us-east-1" as const;

