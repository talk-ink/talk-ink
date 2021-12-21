import React from "react";
import { BiMoon } from "react-icons/bi";

type ButtonSize = "small" | "medium" | "large";

type Props = React.PropsWithChildren<{
  children: React.ReactNode;
  size?: ButtonSize;
}>;

type ButtonSizeValue = {
  [key: string]: string;
  small: string;
  medium: string;
  large: string;
};

function IconButton({ children, size = "large" }: Props) {
  const buttonSize: ButtonSizeValue = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-10 h-10",
  };
  return (
    <button
      className={`flex items-center justify-center hover:bg-neutral-200 ${buttonSize[size]} rounded-md`}
    >
      {children}
    </button>
  );
}

export default IconButton;
