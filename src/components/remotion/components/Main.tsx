import { StorySlides } from "./StorySlides";
import { StoryData } from "../types";

export const Main = (props: StoryData) => {
  return <StorySlides storyData={props} />;
};

