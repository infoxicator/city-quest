import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { addTodo } from '@/mcp-todos'
import { handleMcpRequest } from '@/utils/mcp-handler'

const server = new McpServer({
  name: 'start-server',
  version: '1.0.0',
})

type GreetingMood = 'celebrate' | 'calm' | 'bold'

interface GreetingCardRequestPayload {
  title: string
  subtitle: string
  signature: string
  accentColor: string
  mood: GreetingMood
  generatedAt: string
}

const GREETING_WIDGET_URI = 'ui://widget/greeting-card.html'
const GREETING_CARD_ROUTE_PATH = '/greeting-card'
const APP_BASE_URL = resolveAppBaseUrl()

const DEFAULT_GREETING_MESSAGE =
  'Hope you are finding inspiration around every corner today!'
const DEFAULT_SIGNATURE = 'Your friends at City Quest'
const DEFAULT_ACCENT_COLOR = '#0f172a'
const DEFAULT_MOOD: GreetingMood = 'celebrate'

const DEFAULT_CARD_PAYLOAD: GreetingCardRequestPayload = {
  title: 'Hello from City Quest!',
  subtitle: DEFAULT_GREETING_MESSAGE,
  signature: DEFAULT_SIGNATURE,
  accentColor: DEFAULT_ACCENT_COLOR,
  mood: DEFAULT_MOOD,
  generatedAt: '2024-01-01T00:00:00.000Z',
}

let latestGreetingCardHtml: string | null = null

server.registerTool(
  'addTodo',
  {
    title: 'Tool to add a todo to a list of todos',
    description: 'Add a todo to a list of todos',
    inputSchema: {
      title: z.string().describe('The title of the todo'),
    },
  },
  ({ title }) => ({
    content: [{ type: 'text', text: String(addTodo(title)) }],
  }),
)

server.registerResource(
  'greeting-widget',
  GREETING_WIDGET_URI,
  {},
  async () => {
    const widgetHtml = await buildGreetingWidgetHtml()

    return {
      contents: [
        {
          uri: GREETING_WIDGET_URI,
          mimeType: 'text/html+skybridge',
          text: widgetHtml,
          _meta: {
            'openai/widgetDescription':
              'Renders a colorful greeting card using the structured content returned by renderGreeting.',
            'openai/widgetPrefersBorder': true,
            'openai/widgetCSP': {
              resource_domains: [],
            },
          },
        },
      ],
    }
  },
)

server.registerTool(
  'renderGreeting',
  {
    title: 'Render a greeting card',
    description: 'Shows a friendly greeting UI for the requested recipient.',
    inputSchema: {
      recipient: z
        .string()
        .min(1)
        .describe('Name of the person or group to greet'),
      message: z
        .string()
        .max(280)
        .describe('Optional short message to display under the greeting headline')
        .optional(),
    },
    _meta: {
      'openai/outputTemplate': GREETING_WIDGET_URI,
      'openai/toolInvocation/invoking': 'Rendering the greeting card',
      'openai/toolInvocation/invoked': 'Greeting card rendered',
    },
  },
  async ({ recipient, message }) => {
    const subtitle = message?.trim().length ? message : DEFAULT_GREETING_MESSAGE
    const generatedAt = new Date().toISOString()
    const cardPayload: GreetingCardRequestPayload = {
      title: `Hello, ${recipient}!`,
      subtitle,
      signature: DEFAULT_SIGNATURE,
      accentColor: DEFAULT_ACCENT_COLOR,
      mood: DEFAULT_MOOD,
      generatedAt,
    }
    try {
      latestGreetingCardHtml = await fetchGreetingCardFragment(cardPayload)
    } catch (error) {
      console.error('Failed to fetch greeting card HTML from route', error)
      latestGreetingCardHtml = null
    }

    return {
      content: [
        {
          type: 'text',
          text: `Shared a greeting card with ${recipient}.`,
        },
      ],
      structuredContent: {
        title: cardPayload.title,
        subtitle: cardPayload.subtitle,
        signature: cardPayload.signature,
        mood: cardPayload.mood,
        accentColor: cardPayload.accentColor,
        generatedAt: cardPayload.generatedAt,
      },
      _meta: {
        accentColor: '#f6d365',
      },
    }
  },
)

// server.registerResource(
//   "counter-value",
//   "count://",
//   {
//     title: "Counter Resource",
//     description: "Returns the current value of the counter",
//   },
//   async (uri) => {
//     return {
//       contents: [
//         {
//           uri: uri.href,
//           text: `The counter is at 20!`,
//         },
//       ],
//     };
//   }
// );

export const Route = createFileRoute('/mcp')({
  server: {
    handlers: {
      POST: async ({ request }) => handleMcpRequest(request, server),
    },
  },
})

async function buildGreetingWidgetHtml() {
  let markup = latestGreetingCardHtml

  if (!markup) {
    try {
      markup = await fetchGreetingCardFragment(DEFAULT_CARD_PAYLOAD)
    } catch {
      markup = '<div class="text-sm text-slate-500">Preparing your greeting...</div>'
    }
  }

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color: #0f172a;
        background: #f8fafc;
      }
      body {
        margin: 0;
        padding: 20px;
        min-height: 100vh;
        background: #f8fafc;
        font-family: Inter, 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card-shell {
        width: min(640px, 100%);
      }
    </style>
  </head>
  <body>
    <div class="card-shell">
      ${markup}
    </div>
  </body>
</html>
`.trim()
}

async function fetchGreetingCardFragment(payload: GreetingCardRequestPayload) {
  const path = createGreetingCardPath(payload)
  return getAppsSdkCompatibleHtml(APP_BASE_URL, path)
}

function createGreetingCardPath(payload: GreetingCardRequestPayload) {
  const params = new URLSearchParams({
    title: payload.title,
    subtitle: payload.subtitle,
    signature: payload.signature,
    accentColor: payload.accentColor,
    mood: payload.mood,
    generatedAt: payload.generatedAt,
  })

  return `${GREETING_CARD_ROUTE_PATH}?${params.toString()}`
}

async function getAppsSdkCompatibleHtml(baseUrl: string, path: string) {
  const target = `${baseUrl}${path}`
  const response = await fetch(target)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch greeting widget HTML (${response.statusText})`,
    )
  }

  return await response.text()
}

function resolveAppBaseUrl() {
  const candidates = [
    process.env.MCP_WIDGET_BASE_URL,
    process.env.PUBLIC_BASE_URL,
    process.env.VITE_PUBLIC_BASE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter((value): value is string => Boolean(value))

  const base = candidates[0] ?? 'http://localhost:3000'
  return base.replace(/\/+$/, '')
}
