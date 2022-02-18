import React from "react";

interface Props extends React.HTMLProps<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

function Button({
  children,
  className,
  onClick = () => {},
  type = "button",
  disabled,
}: Props) {
  return (
    <button
      className={`flex items-center px-3 h-8 rounded-md ${
        disabled ? "bg-neutral-300 text-neutral-500" : ""
      }  outline-none ${className} `}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
