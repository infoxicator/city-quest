import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { handleMcpRequest } from "@/utils/mcp-handler";
import { resolveAppBaseUrl } from "@/utils/base-url";


const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  console.log(baseUrl, path);
  const response = await fetch(`${baseUrl}${path}`);
  console.log(response, `${baseUrl}${path}`);
  const html = await response.text();
  return html;
};

const server = new McpServer({
  name: "chatgpt-app",
  version: "1.0.0",
});

const LOCAL_ORIGIN = "http://localhost:3000";

const appBaseUrl = resolveAppBaseUrl();

const resourceOrigin = (() => {
  try {
    console.log(appBaseUrl);
    return new URL(appBaseUrl).origin;
  } catch {
    return LOCAL_ORIGIN;
  }
})();

// Register the HTML template as a resource
server.registerResource(
  "show-guitar-html",
  "ui://widget/show-guitar.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/show-guitar.html",
        mimeType: "text/html+skybridge",
        text: await getAppsSdkCompatibleHtml(appBaseUrl, "greeting"),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetDescription": "Displays a guitar product with styling",
          "openai/widgetCSP": {
            connect_domains: [resourceOrigin],
            resource_domains: [resourceOrigin],
          },
        },
      },
    ],
  })
);

server.registerTool(
  "getGuitars",
  {
    title: "Get all guitars",
    description: "Get all guitar products from the database",
    inputSchema: {},
  },
  async () => {
    return {
      content: [{ type: "text", text: "hello world" }],
    };
  }
);

// Register the tool that references this template
server.registerTool(
  "showGuitar",
  {
    title: "Show a guitar",
    description: "Show a guitar product from the database",
    inputSchema: {
      id: z.string().describe("The id of the guitar to show"),
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/show-guitar.html",
      "openai/toolInvocation/invoking": "Showing a guitar...",
      "openai/toolInvocation/invoked": "Showed a guitar!",
    },
  },
  async ({ id }) => {
    return {
      _meta: {
        "openai/outputTemplate": "ui://widget/show-guitar.html",
        "openai/toolInvocation/invoking": "Showing a guitar...",
        "openai/toolInvocation/invoked": "Showed a guitar!",
      },
      content: [
        {
          type: "text",
          text: "hello world",
        },
      ],
      structuredContent: {},
    };
  }
);

export const Route = createFileRoute("/mcp")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            name: "chatgpt-app",
            version: "1.0.0",
            description: "MCP server for ChatGPT integration",
            capabilities: {
              tools: true,
              resources: true,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      },
      POST: async ({ request }) => {
        return await handleMcpRequest(request, server);
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
          },
        });
      },
    },
  },
});
