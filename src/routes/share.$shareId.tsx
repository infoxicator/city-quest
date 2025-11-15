import { createFileRoute } from "@tanstack/react-router";
import SharedAdventure, { HydrateFallback, type LoaderData } from "@/components/SharePlayer";
import { StoryResponse } from "@/components/remotion/schemata";

function getOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR - you may want to use environment variables or context
  return "http://localhost:3000";
}

export const Route = createFileRoute("/share/$shareId")({
  loader: async ({ params }) => {
    const shareId = params.shareId;
    const origin = getOrigin();

    if (!shareId) {
      return {
        status: "error",
        message: "Missing share identifier.",
        shareUrl: origin,
      } satisfies LoaderData;
    }

    try {
      const res = await fetch(`https://imageplustexttoimage.mcp-ui-flows-nanobanana.workers.dev/api/payloads/${shareId}`);
      if (!res.ok) {
        const message = res.status === 404 ? "We couldn't find that adventure." : "Unable to load shared story.";
        return {
          status: "error",
          message,
          shareUrl: `${origin}/share/${shareId}`,
        } satisfies LoaderData;
      }
      const json = await res.json();
      if (json?.type === "error") {
        return {
          status: "error",
          message: typeof json.message === "string" ? json.message : "Unable to load shared story.",
          shareUrl: `${origin}/share/${shareId}`,
        } satisfies LoaderData;
      }

      const payload = json?.payload;
      const storyPayload = payload?.storyData ?? payload;
      const parsed = StoryResponse.safeParse(storyPayload);
      if (!parsed.success) {
        return {
          status: "error",
          message: "Shared story data is corrupted.",
          shareUrl: `${origin}/share/${shareId}`,
        } satisfies LoaderData;
      }

      return {
        status: "success",
        storyData: parsed.data,
        shareId,
        shareUrl: `${origin}/share/${shareId}`,
      } satisfies LoaderData;
    } catch (error) {
      console.error("Failed to load shared story", error);
      return {
        status: "error",
        message: "Something glitched while loading this adventure.",
        shareUrl: `${origin}/share/${shareId}`,
      } satisfies LoaderData;
    }
  },
  pendingComponent: HydrateFallback,
  component: () => {
    const loaderData = Route.useLoaderData();
    return <SharedAdventure loaderData={loaderData} />;
  },
});

