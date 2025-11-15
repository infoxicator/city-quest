import React from "react";
import { Spinner } from "./Spinner";

export const Loading: React.FC<{
  title?: string;
  subtitle?: string;
  compact?: boolean;
  spinnerColor?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}> = ({
  title = "Rendering video preview…",
  subtitle = "Preparing composition, fonts, and assets",
  compact = false,
  spinnerColor = "#26f7b0",
  titleClassName = "text-white",
  subtitleClassName = "text-[#aeeed2]",
}) => {
  const titleClasses = ["text-lg", "font-semibold", titleClassName].filter(Boolean).join(" ");
  const subtitleClasses = ["text-sm", subtitleClassName].filter(Boolean).join(" ");

  return (
    <div className={compact ? "py-6" : "py-16"}>
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size={56} color={spinnerColor} />
        <div className="space-y-1">
          <p className={titleClasses}>{title}</p>
          <p className={subtitleClasses}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;

