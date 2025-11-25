import { type CreateUIResourceOptions, createUIResource } from "@mcp-ui/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ZodRawShape, z } from "zod";
import { resolveAppBaseUrl } from "./base-url.ts";
import { BUILD_TIMESTAMP } from "./build-timestamp.ts";

const version = BUILD_TIMESTAMP;

const createAdventureWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<link rel="stylesheet" href="${baseUrl}/widgets/styles.css">
<div id="tanstack-app-root"></div>
<script type="module" src="${baseUrl}widgets/greeting.js"></script>
`;

const createScoreBoardWidgetHtml = (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/widgets/greeting.css">
<link rel="stylesheet" href="${baseUrl}/widgets/styles.css">
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

type WidgetCspMetadata = {
	connect_domains?: string[];
	resource_domains?: string[];
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
	widgetCSP?: WidgetCspMetadata;
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
			resultMessage: "Your CityQuest adventure has started. Provide your name and your adventure type in the widget above and tap Start Adventure",
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
				"Update and display the player's progress: level (quests completed), gold earned, and badges. Level increments by 1 per quest completion. Gold amount is determined by question or challenge difficulty. Badges can be awarded from the available badges for the adventure type.",
			invokingMessage: `Syncing your guild ledger...`,
			invokedMessage: `Score beacon synced.`,
			resultMessage: "The score tracker has been updated.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createScoreBoardWidgetHtml(baseUrl)),
			inputSchema: {
				gameId: z.string().describe("The game ID to update progress for. Required."),
				adventureType: z.enum(['tour', 'foodie', 'race']).describe("The adventure type. Required to validate badges."),
				mode: z.enum(['default', 'kitze']).optional().describe("The display mode for the scoreboard. Use 'kitze' for the Junk Food Bingo mode."),
				level: z.number().optional().describe("Amount to increment level by (typically 1 per quest completion). If not provided, level remains unchanged."),
				gold: z.number().optional().describe("Amount of gold to add to the player's total. Determined by question difficulty. If not provided, gold remains unchanged."),
				badge: z.string().optional().describe("Badge name to award. Must be one of: Tour: Skyline Scout, Bridge Walker, Atrium Explorer, Crystal Navigator, Skyhollow Master; Foodie: Spice Taster, Stall Hunter, Flavor Seeker, Harbor Gourmet, Culinary Legend; Race: Wind Runner, Circuit Racer, Griffin Rider, Speed Demon, Champion Courier. For 'kitze' mode, use the restaurant name (e.g. Wendy's, Shake Shack)."),
			} as const,
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
		inputSchema: {
			gameId: z.string().describe("The game ID this video summary is for. Required."),
			slides: z.array(
				z.object({
					text: z.string().max(200).describe("Summary of every quest completed"),
				}),
			).describe("Array of slides, each containing a summary of a completed quest"),
		} as const,
		outputSchema: {},
		getStructuredContent: async () => ({}),
	}),
		createWidget({
			name: "take-picture",
			title: "Take Picture",
			description:
				"After arriving at your location, take a picture or a selfie for your CityQuest adventure to claim a reward",
			invokingMessage: `Preparing camera interface...`,
			invokedMessage: `Camera ready.`,
			resultMessage: "The picture widget is ready. Capture or upload an image to claim your reward. Wait for the player to claim their reward before continuing.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createTakePictureWidgetHtml(baseUrl)),
			inputSchema: {
				gameId: z.string().optional().describe("The game ID to associate the picture with. If not provided, will be retrieved from URL params or localStorage."),
				location: z.string().optional().describe("The location name where the picture is being taken."),
				description: z.string().optional().describe("Any details about the adventure so far at this place"),
			} as const,
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
						...(widget.widgetCSP
							? { "openai/widgetCSP": widget.widgetCSP }
							: {}),
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
			async (args: any, _extra?: any) => {
				const structuredContent = widget.getStructuredContent
					? await widget.getStructuredContent(args as any)
					: {};
				return {
					content: [
						{ type: "text" as const, text: widget.resultMessage },
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
				} as any;
			},
		);
	}
}
