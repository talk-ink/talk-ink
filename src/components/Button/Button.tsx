import React from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}>;

function Button({
  children,
  className,
  onClick = () => {},
  type = "button",
  disabled,
}: Props) {
  return (
    <button
      className={`flex items-center px-3 h-8 rounded-md ${className} disabled:bg-neutral-300 disabled:text-neutral-500 outline-none`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
