import React from "react";

type ButtonSize = "small" | "medium" | "large";

type Props = React.PropsWithChildren<{
  children: React.ReactNode;
  size?: ButtonSize;
  onClick?: () => void;
  className?: string;
}>;

type ButtonSizeValue = {
  [key: string]: string;
  small: string;
  medium: string;
  large: string;
};

function IconButton({
  children,
  size = "large",
  onClick = () => {},
  className,
}: Props) {
  const buttonSize: ButtonSizeValue = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-10 h-10",
  };
  return (
    <button
      type="button"
      className={`flex items-center justify-center hover:bg-neutral-200 ${buttonSize[size]} rounded-md ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default IconButton;
