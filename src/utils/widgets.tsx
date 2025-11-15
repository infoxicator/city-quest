import { type CreateUIResourceOptions, createUIResource } from "@mcp-ui/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ZodRawShape, z } from "zod";
import { resolveAppBaseUrl } from "./base-url.ts";
import { BUILD_TIMESTAMP } from "./build-timestamp.ts";

const version = BUILD_TIMESTAMP;

const createAdventureWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<div id="tanstack-app-root"></div>
<script type="module" src="${baseUrl}widgets/greeting.js"></script>
`;

const createScoreBoardWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<div id="tanstack-app-root"></div>
<script type="module" src="${baseUrl}widgets/scoreboard.js"></script>
`;

const createVideoSummaryWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<div id="tanstack-app-root"></div>
<script type="module" src="${baseUrl}widgets/video-summary.js"></script>
`;

const createTakePictureWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<div id="tanstack-app-root"></div>
<script type="module" src="${baseUrl}widgets/take-picture.js"></script>
`;

function clampToPercentage(value?: number | null) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return undefined;
	}
	return Math.min(100, Math.max(0, value));
}

function getVideoEmbedUrl(url?: string | null) {
	if (!url) {
		return null;
	}
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, "");
		if (host.endsWith("youtube.com")) {
			const videoId = parsed.searchParams.get("v");
			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}
			const pathId = parsed.pathname.split("/").filter(Boolean).pop();
			if (pathId) {
				return `https://www.youtube.com/embed/${pathId}`;
			}
		}
		if (host === "youtu.be") {
			const id = parsed.pathname.replace("/", "");
			if (id) {
				return `https://www.youtube.com/embed/${id}`;
			}
		}
		if (host.endsWith("vimeo.com")) {
			const vimeoId = parsed.pathname.split("/").filter(Boolean).pop();
			if (vimeoId) {
				return `https://player.vimeo.com/video/${vimeoId}`;
			}
		}
		return url;
	} catch (error) {
		console.debug("Unable to build embed url", error);
		return url;
	}
}

type WidgetOutput<Input extends ZodRawShape, Output extends ZodRawShape> = {
	inputSchema: Input;
	outputSchema: Output;
	getStructuredContent: (
		args: {
			[Key in keyof Input]: z.infer<Input[Key]>;
		},
	) => Promise<{
		[Key in keyof Output]: z.infer<Output[Key]>;
	}>;
};

type Widget<Input extends ZodRawShape, Output extends ZodRawShape> = {
	name: string;
	title: string;
	resultMessage: string;
	description?: string;
	invokingMessage?: string;
	invokedMessage?: string;
	widgetAccessible?: boolean;
	widgetPrefersBorder?: boolean;
	resultCanProduceWidget?: boolean;
	getHtml: () => Promise<string>;
} & WidgetOutput<Input, Output>;

function createWidget<Input extends ZodRawShape, Output extends ZodRawShape>(
	widget: Widget<Input, Output>,
): Widget<Input, Output> {
	return widget;
}
export async function registerWidgets(server: McpServer) {
	// const baseUrl = agent.requireDomain()
	const baseUrl = resolveAppBaseUrl();
	// const getResourceUrl = (resourcePath: string) =>
	// 	new URL(resourcePath, baseUrl).toString()
	const widgets = [
		createWidget({
			name: "play-cityquest",
			title: "Start CityQuest Adventure",
			description:
				"Launch the CityQuest onboarding console to register a hero and begin a new mission.",
			invokingMessage: `Starting your CityQuest adventure...`,
			invokedMessage: `CityQuest adventure started. The game master is ready to guide you on your adventure.`,
			resultMessage: "Your CityQuest adventure has started. Give me your name and snap a picture for your avatar. Select your adventure type and tap start and the game master will guide you",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createAdventureWidgetHtml(baseUrl)),
			inputSchema: {} as const,
			outputSchema: {},
			getStructuredContent: async () => ({}),
		}),
		createWidget({
			name: "update-score",
			title: "Update CityQuest Score",
			description:
				"Render a live scoreboard card with the latest player totals, progress, and badges.",
			invokingMessage: `Syncing your guild ledger...`,
			invokedMessage: `Score beacon synced.`,
			resultMessage: "The score tracker has been updated.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createScoreBoardWidgetHtml(baseUrl)),
			inputSchema: {} as const,
			outputSchema: {},
			getStructuredContent: async () => ({}),
		}),
		createWidget({
			name: "video-summary",
			title: "CityQuest Video Summary",
			description:
				"At the end of your CityQuest adventure, generate a summary video of your journey.",
			invokingMessage: `Stitching together your mission footage...`,
			invokedMessage: `Video recap ready.`,
			resultMessage: "The video summary is ready. Enjoy your recap!",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createVideoSummaryWidgetHtml(baseUrl)),
			inputSchema: {},
			outputSchema: {},
			getStructuredContent: async () => ({}),
		}),
		createWidget({
			name: "take-picture",
			title: "Take Picture",
			description:
				"After arriving at your location, take a picture or a selfie for your CityQuest adventure.",
			invokingMessage: `Preparing camera interface...`,
			invokedMessage: `Camera ready.`,
			resultMessage: "The picture widget is ready. Capture or upload an image to continue.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createTakePictureWidgetHtml(baseUrl)),
			inputSchema: {} as const,
			outputSchema: {},
			getStructuredContent: async () => ({}),
		}),
	];

	for (const widget of widgets) {
		const name = `${widget.name}-${version}`;
		const uri = `ui://widget/${name}.html` as `ui://${string}`;

		const resourceInfo: CreateUIResourceOptions = {
			uri,
			encoding: "text",
			content: {
				type: "rawHtml",
				htmlString: await widget.getHtml(),
			},
		};

		server.registerResource(name, uri, {}, async () => ({
			contents: [
				createUIResource({
					...resourceInfo,
					metadata: {
						"openai/widgetDescription": widget.description,
						// "openai/widgetCSP": {
						// 	connect_domains: [],
						// 	resource_domains: [baseUrl],
						// },
						...(widget.widgetPrefersBorder
							? { "openai/widgetPrefersBorder": true }
							: {}),
					},
					adapters: {
						appsSdk: {
							enabled: true,
						},
					},
				}).resource,
			],
		}));

		server.registerTool(
			name,
			{
				title: widget.title,
				description: widget.description,
				_meta: {
					"openai/widgetDomain": baseUrl,
					"openai/outputTemplate": uri,
					"openai/toolInvocation/invoking": widget.invokingMessage,
					"openai/toolInvocation/invoked": widget.invokedMessage,
					...(widget.resultCanProduceWidget
						? { "openai/resultCanProduceWidget": true }
						: {}),
					...(widget.widgetAccessible
						? { "openai/widgetAccessible": true }
						: {}),
				},
				inputSchema: widget.inputSchema,
				outputSchema: widget.outputSchema,
				annotations: { readOnlyHint: true, openWorldHint: false },
			},
			async (args: Parameters<typeof widget.getStructuredContent>[0]) => {
				const structuredContent = widget.getStructuredContent
					? await widget.getStructuredContent(args)
					: {};
				return {
					content: [
						{ type: "text", text: widget.resultMessage },
						createUIResource({
							...resourceInfo,
							uiMetadata: {
								"initial-render-data": {
									toolInput: args,
									toolOutput: structuredContent,
								},
							},
						}),
					],
					structuredContent,
				};
			},
		);
	}
}
