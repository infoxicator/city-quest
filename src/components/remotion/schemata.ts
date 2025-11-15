import { z } from "zod";

export const CompositionProps = z.object({
  title: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "React Router and Remotion",
};

export const RenderRequest = z.object({
  inputProps: CompositionProps,
});

export const ProgressRequest = z.object({
  bucketName: z.string(),
  id: z.string(),
});

export type ProgressResponse =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "done";
      url: string;
      size: number;
    };

export const StoryResponse = z
  .object({
    title: z.string(),
    date: z.string().datetime(),
    mainImage: z.string().url().optional(),
    slides: z
      .array(
      z.object({
        image: z.string().url(),
        text: z.string().max(500),
      })
    )
      .min(1),
  })
  .passthrough();

