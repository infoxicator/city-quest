import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import SharedAdventure, { HydrateFallback, type LoaderData } from "@/components/SharePlayer";
import { StoryResponse } from "@/components/remotion/schemata";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  return "https://city-quest.netlify.app";
}

export const Route = createFileRoute("/share/$shareId")({
  component: () => {
    const { shareId } = Route.useParams();
    const [loaderData, setLoaderData] = useState<LoaderData | null>(null);

    // Fetch story from Convex database
    const storyData = useQuery(
      api.games.getStory,
      shareId && shareId !== "local-story" ? { storyId: shareId as Id<"stories"> } : "skip",
    );

    useEffect(() => {
      const baseUrl = getBaseUrl();

      if (!shareId) {
        setLoaderData({
          status: "error",
          message: "Missing share identifier.",
          shareUrl: baseUrl,
        });
        return;
      }

      // If it's a local story, skip database lookup
      if (shareId === "local-story") {
        setLoaderData({
          status: "error",
          message: "Invalid story ID.",
          shareUrl: `${baseUrl}/share/${shareId}`,
        });
        return;
      }

      // Wait for story data to load
      if (storyData === undefined) {
        return;
      }

      // Story not found
      if (!storyData) {
        setLoaderData({
          status: "error",
          message: "We couldn't find that adventure.",
          shareUrl: `${baseUrl}/share/${shareId}`,
        });
        return;
      }

      // Transform story data to match StoryResponse schema
      const storyPayload = {
        title: storyData.title,
        date: storyData.date,
        mainImage: storyData.mainImage,
        slides: storyData.slides,
      };

      const parsed = StoryResponse.safeParse(storyPayload);
      if (!parsed.success) {
        setLoaderData({
          status: "error",
          message: "Shared story data is corrupted.",
          shareUrl: `${baseUrl}/share/${shareId}`,
        });
        return;
      }

      setLoaderData({
        status: "success",
        storyData: parsed.data,
        shareId,
        shareUrl: `${baseUrl}/share/${shareId}`,
      });
    }, [shareId, storyData]);

    // Show loading state while fetching
    if (!loaderData) {
      return <HydrateFallback />;
    }

    return <SharedAdventure loaderData={loaderData} />;
  },
  pendingComponent: HydrateFallback,
});

