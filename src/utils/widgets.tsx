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
			invokingMessage: `Painting the skyline for your hero...`,
			invokedMessage: `CityQuest console ready.`,
			resultMessage: "Your adventure console is open and ready.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createAdventureWidgetHtml(baseUrl)),
			inputSchema: {} as const,
			outputSchema: {
				status: z
					.string()
					.describe("Short status note describing whether the console loaded."),
				adventureUrl: z
					.string()
					.url()
					.describe("URL that opens the CityQuest greeting experience."),
			},
			getStructuredContent: async () => ({
				status: "ready",
				adventureUrl: `${baseUrl}greeting`,
			}),
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
			inputSchema: {
				playerName: z
					.string()
					.min(1)
					.describe("Name of the player receiving the score update."),
				score: z.number().describe("Total score after applying this update."),
				progressPercentage: z
					.number()
					.min(0)
					.max(100)
					.optional()
					.describe("Percent of the current quest that is complete."),
				badges: z
					.array(z.string())
					.max(6)
					.optional()
					.describe(
						"List of badge or perk names that were unlocked during the update.",
					),
				lastCheckpoint: z
					.string()
					.optional()
					.describe(
						"Narrative description of the newest checkpoint or action.",
					),
				scoreDelta: z
					.number()
					.optional()
					.describe(
						"How much the score changed in this update (positive or negative).",
					),
				status: z
					.string()
					.optional()
					.describe("Short sentence that appears on the status line."),
			},
			outputSchema: {
				playerName: z.string(),
				score: z.number(),
				progressPercentage: z.number().optional(),
				badges: z.array(z.string()).optional(),
				lastCheckpoint: z.string().optional(),
				scoreDelta: z.number().optional(),
				status: z.string(),
				updatedAt: z.string().describe("ISO 8601 timestamp of the update."),
			},
			getStructuredContent: async (args) => {
				const playerName = args.playerName.trim().length
					? args.playerName.trim()
					: "Adventurer";
				const badges = (args.badges ?? [])
					.map((badge) => badge.trim())
					.filter(Boolean)
					.slice(0, 6);
				const progress = clampToPercentage(args.progressPercentage);
				const payload: {
					playerName: string;
					score: number;
					badges: string[];
					lastCheckpoint: string;
					status: string;
					updatedAt: string;
					progressPercentage?: number;
					scoreDelta?: number;
				} = {
					playerName,
					score: args.score,
					badges,
					lastCheckpoint:
						(args.lastCheckpoint ?? "Awaiting new intel.").trim() ||
						"Awaiting new intel.",
					status:
						(args.status ?? "Score beacon updated").trim() ||
						"Score beacon updated",
					updatedAt: new Date().toISOString(),
				};
				if (progress !== undefined) {
					payload.progressPercentage = progress;
				}
				if (typeof args.scoreDelta === "number") {
					payload.scoreDelta = args.scoreDelta;
				}
				return payload;
			},
		}),
		createWidget({
			name: "video-summary",
			title: "CityQuest Video Summary",
			description:
				"Embed a mission recording with a written recap, highlights, and follow-up action.",
			invokingMessage: `Stitching together your mission footage...`,
			invokedMessage: `Video recap ready.`,
			resultMessage: "The video summary widget has been rendered.",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(createVideoSummaryWidgetHtml(baseUrl)),
			inputSchema: {
				title: z
					.string()
					.min(1)
					.describe("Title that will appear at the top of the video summary."),
				videoUrl: z
					.string()
					.url()
					.describe("Direct link to the video resource or livestream."),
				summary: z
					.string()
					.min(1)
					.describe(
						"Multi-line narrative that describes what happens in the video.",
					),
				highlights: z
					.array(z.string())
					.max(8)
					.optional()
					.describe(
						"Key bullets you would like highlighted under the summary.",
					),
				callToAction: z
					.string()
					.optional()
					.describe("Label for the call-to-action button beneath the summary."),
				ctaUrl: z
					.string()
					.url()
					.optional()
					.describe(
						"URL or deeplink that should be opened when the CTA is clicked.",
					),
				duration: z
					.string()
					.optional()
					.describe('Friendly duration label (e.g., "3m 42s").'),
				thumbnailUrl: z
					.string()
					.url()
					.optional()
					.describe("Poster image to show when rendering a direct video tag."),
			},
			outputSchema: {
				title: z.string(),
				videoUrl: z.string().url(),
				summary: z.string(),
				highlights: z.array(z.string()).optional(),
				callToAction: z.string().optional(),
				ctaUrl: z.string().url().optional(),
				duration: z.string().optional(),
				thumbnailUrl: z.string().url().optional(),
				status: z.string(),
				embedUrl: z.string().url().optional(),
			},
			getStructuredContent: async (args) => {
				const highlights = (args.highlights ?? [])
					.map((item) => item.trim())
					.filter(Boolean)
					.slice(0, 8);
				const embedUrl = getVideoEmbedUrl(args.videoUrl);
				const payload: {
					title: string;
					videoUrl: string;
					summary: string;
					status: string;
					highlights?: string[];
					callToAction?: string;
					ctaUrl?: string;
					duration?: string;
					thumbnailUrl?: string;
					embedUrl?: string;
				} = {
					title: args.title.trim(),
					videoUrl: args.videoUrl,
					summary: args.summary.trim(),
					status: "ready",
				};
				if (highlights.length) {
					payload.highlights = highlights;
				}
				if (args.callToAction?.trim()) {
					payload.callToAction = args.callToAction.trim();
				}
				if (args.ctaUrl) {
					payload.ctaUrl = args.ctaUrl;
				} else {
					payload.ctaUrl = args.videoUrl;
				}
				if (args.duration?.trim()) {
					payload.duration = args.duration.trim();
				}
				if (args.thumbnailUrl) {
					payload.thumbnailUrl = args.thumbnailUrl;
				}
				if (embedUrl) {
					payload.embedUrl = embedUrl;
				}
				return payload;
			},
		}),
		createWidget({
			name: "calculator",
			title: "Calculator",
			description: "A simple calculator",
			invokingMessage: `Getting your calculator ready`,
			invokedMessage: `Here's your calculator`,
			resultMessage: "The calculator has been rendered",
			widgetAccessible: true,
			resultCanProduceWidget: true,
			getHtml: () => Promise.resolve(`<div>Hello, World!</div>`),
			inputSchema: {
				display: z
					.string()
					.optional()
					.describe("The initial current display value on the calculator"),
				previousValue: z
					.number()
					.optional()
					.describe(
						'The initial previous value on the calculator. For example, if the user says "I want to add 5 to a number" set this to 5',
					),
				operation: z
					.enum(["+", "-", "*", "/"])
					.optional()
					.describe(
						'The initial operation on the calculator. For example, if the user says "I want to add 5 to a number" set this to "+"',
					),
				waitingForNewValue: z
					.boolean()
					.optional()
					.describe(
						'Whether the calculator is waiting for a new value. For example, if the user says "I want to add 5 to a number" set this to true. If they say "subtract 3 from 4" set this to false.',
					),
				errorState: z
					.boolean()
					.optional()
					.describe("Whether the calculator is in an error state"),
			},
			outputSchema: {
				display: z.string().optional(),
				previousValue: z.number().optional(),
				operation: z.enum(["+", "-", "*", "/"]).optional(),
				waitingForNewValue: z.boolean().optional(),
				errorState: z.boolean().optional(),
			},
			getStructuredContent: async (args) => args,
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
