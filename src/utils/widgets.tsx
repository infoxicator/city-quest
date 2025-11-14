import { type CreateUIResourceOptions, createUIResource } from "@mcp-ui/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ZodRawShape, z } from "zod";
import { resolveAppBaseUrl } from "./base-url.ts";
import { BUILD_TIMESTAMP } from "./build-timestamp.ts";

const version = BUILD_TIMESTAMP;

const SCOREBOARD_WIDGET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>CityQuest Score Tracker</title>
<style>
:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at top, #0d1f2d 0%, #01070f 65%);
  color: #f8fafc;
  font-family: inherit;
}
.widget {
  max-width: 720px;
  padding: 28px;
  margin: 0 auto;
  background: rgba(4, 19, 30, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.65);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 12px;
  color: #67e8f9;
  margin-bottom: 12px;
}
header h1 {
  margin: 0;
  font-size: 32px;
}
.checkpoint {
  margin: 6px 0 0;
  color: #e0f2fe;
  font-size: 15px;
}
.score-display {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.panel {
  padding: 18px;
  border-radius: 18px;
  background: rgba(8, 47, 73, 0.55);
  border: 1px solid rgba(94, 234, 212, 0.2);
  min-height: 130px;
}
.panel .label {
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bae6fd;
}
.panel .value {
  margin: 8px 0 0;
  font-size: 40px;
  font-weight: 700;
  color: #f8fafc;
}
.panel .value-small {
  margin: 8px 0 0;
  font-size: 18px;
  color: #e0f2fe;
}
.progress {
  margin-top: 12px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.35);
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #22d3ee);
  width: 0%;
  transition: width 250ms ease;
}
.badges {
  margin-top: 32px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(8, 26, 35, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
}
.badge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #bae6fd;
}
.badge-grid {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.badge {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.5);
  background: rgba(45, 212, 191, 0.15);
  font-size: 13px;
  color: #ccfbf1;
}
.status-line {
  margin-top: 28px;
  font-size: 14px;
  color: #e2e8f0;
}
.status-line strong {
  color: #7dd3fc;
}
@media (max-width: 540px) {
  .widget {
    padding: 20px;
  }
  header h1 {
    font-size: 24px;
  }
  .panel .value {
    font-size: 32px;
  }
}
</style>
</head>
<body>
<div class="widget" data-widget="score">
  <header>
    <p class="eyebrow">CityQuest // Score Beacon</p>
    <h1 data-field="player-name">Guild Runner</h1>
    <p class="checkpoint" data-field="checkpoint">Awaiting your signal.</p>
  </header>
  <section class="score-display">
    <div class="panel">
      <p class="label">Total Score</p>
      <p class="value" data-field="score-value">0</p>
    </div>
    <div class="panel">
      <p class="label">Progress</p>
      <div class="progress">
        <div class="progress-bar" data-field="progress-bar"></div>
      </div>
      <p class="value-small"><span data-field="progress-value">0</span>% synced</p>
    </div>
  </section>
  <section class="badges">
    <div class="badge-header">
      <span>Badges + Perks</span>
      <time data-field="timestamp">--:--</time>
    </div>
    <div class="badge-grid" data-field="badges"></div>
  </section>
  <p class="status-line">
    Last dispatch: <strong data-field="status">Standing by</strong>
  </p>
</div>
<script>
(function(){
  const root = document.querySelector('[data-widget="score"]');
  if (!root) return;
  const refs = {
    name: root.querySelector('[data-field="player-name"]'),
    checkpoint: root.querySelector('[data-field="checkpoint"]'),
    score: root.querySelector('[data-field="score-value"]'),
    progressValue: root.querySelector('[data-field="progress-value"]'),
    progressBar: root.querySelector('[data-field="progress-bar"]'),
    badges: root.querySelector('[data-field="badges"]'),
    status: root.querySelector('[data-field="status"]'),
    timestamp: root.querySelector('[data-field="timestamp"]'),
  };

  const fallbackData = {
    playerName: 'Guild Runner',
    score: 0,
    progressPercentage: 0,
    badges: ['Awaiting briefing'],
    lastCheckpoint: 'No score changes reported yet.',
    status: 'Standing by',
    updatedAt: new Date().toISOString(),
  };

  function clamp(value) {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }

  function render(data) {
    const payload = Object.assign({}, fallbackData, data || {});
    if (refs.name) refs.name.textContent = payload.playerName || 'Adventurer';
    if (refs.checkpoint) refs.checkpoint.textContent = payload.lastCheckpoint || 'Tracking your footsteps...';
    if (refs.score) refs.score.textContent = typeof payload.score === 'number' ? payload.score.toLocaleString() : '0';
    const progress = clamp(payload.progressPercentage);
    if (refs.progressValue) refs.progressValue.textContent = progress.toFixed(0);
    if (refs.progressBar) refs.progressBar.style.width = progress + '%';
    if (refs.status) refs.status.textContent = payload.status || 'Standing by';
    if (refs.timestamp) {
      const date = payload.updatedAt ? new Date(payload.updatedAt) : new Date();
      refs.timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (refs.badges) {
      refs.badges.innerHTML = '';
      const list = Array.isArray(payload.badges) ? payload.badges.slice(0, 6) : [];
      if (!list.length) {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = 'No badges yet';
        refs.badges.appendChild(span);
      } else {
        list.forEach((text) => {
          const span = document.createElement('span');
          span.className = 'badge';
          span.textContent = text;
          refs.badges.appendChild(span);
        });
      }
    }
  }

  function latestToolOutput() {
    if (window.__MCP_UI_INITIAL_RENDER_DATA__ && window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput) {
      return window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput;
    }
    if (window.__MCP_UI_INITIAL_RENDER_DATA__) {
      return window.__MCP_UI_INITIAL_RENDER_DATA__;
    }
    if (window.openai && window.openai.toolOutput) {
      return window.openai.toolOutput;
    }
    if (window.__MCP_WIDGET_LAST_TOOL_OUTPUT__) {
      return window.__MCP_WIDGET_LAST_TOOL_OUTPUT__;
    }
    return null;
  }

  let lastSignature = '';
  function sync() {
    const data = latestToolOutput() || fallbackData;
    window.__MCP_WIDGET_LAST_TOOL_OUTPUT__ = data;
    const nextSignature = JSON.stringify(data);
    if (nextSignature === lastSignature) {
      return;
    }
    lastSignature = nextSignature;
    render(data);
  }

  sync();
  setInterval(sync, 700);
  window.addEventListener('message', sync);
})();
</script>
</body>
</html>
`;

const VIDEO_SUMMARY_WIDGET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>CityQuest Video Summary</title>
<style>
:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, #0f172a, #020617 70%);
  color: #f8fafc;
  font-family: inherit;
}
.widget {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px;
  border-radius: 24px;
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.65);
}
.media {
  position: relative;
  padding-bottom: 56.25%;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.35);
}
.media iframe,
.media video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.media video {
  background: #000;
}
.content {
  margin-top: 24px;
  display: grid;
  gap: 20px;
}
.content h1 {
  margin: 0;
  font-size: 30px;
}
.summary p {
  margin: 0 0 12px;
  color: #cbd5f5;
  line-height: 1.6;
}
.highlights {
  display: grid;
  gap: 10px;
}
.highlight {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(147, 197, 253, 0.3);
  font-size: 15px;
}
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  border: 1px solid rgba(248, 250, 252, 0.4);
  color: #0f172a;
  background: linear-gradient(90deg, #a5f3fc, #f9a8d4);
  text-decoration: none;
  font-weight: 600;
}
.meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #cbd5f5;
}
@media (max-width: 640px) {
  .widget {
    padding: 20px;
  }
  .content h1 {
    font-size: 24px;
  }
}
</style>
</head>
<body>
<div class="widget" data-widget="video">
  <div class="media">
    <iframe data-role="video-frame" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="CityQuest briefing" style="display:none"></iframe>
    <video data-role="video-player" controls playsinline style="display:none"></video>
  </div>
  <div class="content">
    <div>
      <p class="eyebrow">Mission Debrief</p>
      <h1 data-field="title">CityQuest Broadcast</h1>
      <div class="meta">
        <span data-field="duration">--:--</span>
      </div>
    </div>
    <div class="summary" data-field="summary">
      <p>Awaiting summary transmission...</p>
    </div>
    <div>
      <p class="eyebrow">Highlights</p>
      <div class="highlights" data-field="highlights"></div>
    </div>
    <div>
      <a class="cta" data-field="cta" href="#" target="_blank" rel="noreferrer noopener">Open briefing</a>
    </div>
  </div>
</div>
<script>
(function(){
  const root = document.querySelector('[data-widget="video"]');
  if (!root) return;
  const refs = {
    iframe: root.querySelector('[data-role="video-frame"]'),
    video: root.querySelector('[data-role="video-player"]'),
    title: root.querySelector('[data-field="title"]'),
    summary: root.querySelector('[data-field="summary"]'),
    highlights: root.querySelector('[data-field="highlights"]'),
    duration: root.querySelector('[data-field="duration"]'),
    cta: root.querySelector('[data-field="cta"]'),
  };

  const fallbackData = {
    title: 'CityQuest Status Briefing',
    summary: 'Your mission summary will appear here once the guild compiles footage.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    highlights: ['Scouting team preparing assets'],
    callToAction: 'Launch video',
    ctaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '--:--',
  };

  function renderSummary(container, text) {
    if (!container) return;
    container.innerHTML = '';
    const chunks = (text || '').split('\n').map(function(part){ return part.trim(); }).filter(Boolean);
    if (!chunks.length) {
      const para = document.createElement('p');
      para.textContent = 'No summary provided yet.';
      container.appendChild(para);
      return;
    }
    chunks.forEach(function(part){
      const para = document.createElement('p');
      para.textContent = part;
      container.appendChild(para);
    });
  }

  function renderHighlights(container, list) {
    if (!container) return;
    container.innerHTML = '';
    const items = Array.isArray(list) ? list.slice(0, 6) : [];
    if (!items.length) {
      const div = document.createElement('div');
      div.className = 'highlight';
      div.textContent = 'No highlights available yet.';
      container.appendChild(div);
      return;
    }
    items.forEach(function(item, index){
      const div = document.createElement('div');
      div.className = 'highlight';
      div.textContent = (index + 1) + '. ' + item;
      container.appendChild(div);
    });
  }

  function applyMedia(payload) {
    const iframe = refs.iframe;
    const video = refs.video;
    if (iframe) iframe.style.display = 'none';
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.style.display = 'none';
      video.removeAttribute('poster');
    }
    if (payload.embedUrl && iframe) {
      iframe.src = payload.embedUrl;
      iframe.style.display = 'block';
      return;
    }
    if (payload.videoUrl && video) {
      video.src = payload.videoUrl;
      if (payload.thumbnailUrl) {
        video.setAttribute('poster', payload.thumbnailUrl);
      }
      video.style.display = 'block';
    }
  }

  function render(data) {
    const payload = Object.assign({}, fallbackData, data || {});
    if (refs.title) refs.title.textContent = payload.title;
    renderSummary(refs.summary, payload.summary);
    renderHighlights(refs.highlights, payload.highlights);
    if (refs.duration) refs.duration.textContent = payload.duration || '--:--';
    if (refs.cta) {
      refs.cta.textContent = payload.callToAction || 'Open briefing';
      if (payload.ctaUrl) {
        refs.cta.href = payload.ctaUrl;
      } else if (payload.videoUrl) {
        refs.cta.href = payload.videoUrl;
      }
    }
    applyMedia(payload);
  }

  function latestToolOutput() {
    if (window.__MCP_UI_INITIAL_RENDER_DATA__ && window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput) {
      return window.__MCP_UI_INITIAL_RENDER_DATA__.toolOutput;
    }
    if (window.__MCP_UI_INITIAL_RENDER_DATA__) {
      return window.__MCP_UI_INITIAL_RENDER_DATA__;
    }
    if (window.openai && window.openai.toolOutput) {
      return window.openai.toolOutput;
    }
    if (window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__) {
      return window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__;
    }
    return null;
  }

  let lastSignature = '';
  function sync() {
    const data = latestToolOutput() || fallbackData;
    window.__MCP_WIDGET_LAST_VIDEO_OUTPUT__ = data;
    const nextSignature = JSON.stringify(data);
    if (nextSignature === lastSignature) {
      return;
    }
    lastSignature = nextSignature;
    render(data);
  }

  sync();
  setInterval(sync, 700);
  window.addEventListener('message', sync);
})();
</script>
</body>
</html>
`;

const createAdventureWidgetHtml = (baseUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Start CityQuest</title>
<style>
:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 20% 20%, #0f172a, #020617 70%);
  color: #e2e8f0;
  font-family: inherit;
}
.widget {
  width: min(640px, calc(100% - 32px));
  padding: 32px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(94, 234, 212, 0.35);
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.7);
}
.widget h1 {
  margin: 0 0 12px;
  font-size: 34px;
}
.widget p {
  margin: 0 0 8px;
  color: #cbd5f5;
}
ol {
  margin: 18px 0 28px 20px;
  padding: 0;
  color: #bae6fd;
}
li {
  margin-bottom: 10px;
}
a.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 999px;
  border: 1px solid rgba(248, 250, 252, 0.4);
  color: #041625;
  background: linear-gradient(120deg, #5eead4, #38bdf8);
  font-weight: 600;
  text-decoration: none;
}
@media (max-width: 520px) {
  .widget {
    padding: 24px;
  }
  .widget h1 {
    font-size: 26px;
  }
}
</style>
</head>
<body>
<section class="widget">
  <p class="eyebrow">CityQuest Dispatch</p>
  <h1>Start a New Adventure</h1>
  <p>Spin up the CityQuest console to register a player, upload an avatar, and brief the guild on the mission at hand.</p>
  <ol>
    <li>Open the adventure console.</li>
    <li>Choose a path, set the hero name, and drop in an avatar.</li>
    <li>Press <strong>Launch Quest</strong> to generate a personalized story.</li>
  </ol>
  <a class="cta" href="${baseUrl}greeting" target="_blank" rel="noreferrer noopener">Open Adventure Console</a>
</section>
</body>
</html>
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
			name: "start-cityquest",
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
			getHtml: () => Promise.resolve(SCOREBOARD_WIDGET_HTML),
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
			getHtml: () => Promise.resolve(VIDEO_SUMMARY_WIDGET_HTML),
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
						"openai/widgetCSP": {
							connect_domains: [],
							resource_domains: [baseUrl],
						},
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
