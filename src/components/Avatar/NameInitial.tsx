import React from "react";
import { getNameInitial } from "utils/helper";

type TProps = {
  className?: string;
  name: string;
  size?: "small" | "medium" | "large";
};

function NameInitial({ className, name, size = "medium" }: TProps) {
  const sizeStr = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10",
  };
  const fontSizeStr = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl",
  };
  return (
    <div
      className={`${sizeStr[size]} rounded-full flex items-center justify-center overflow-hidden bg-indigo-500 text-white uppercase ${fontSizeStr[size]} ${className}`}
    >
      {getNameInitial(name)}
    </div>
  );
}

export default NameInitial;
