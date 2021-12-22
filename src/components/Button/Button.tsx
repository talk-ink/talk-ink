import React, { HtmlHTMLAttributes } from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "submit" | "button";
}>;

function Button({ children, className, onClick = () => {}, type }: Props) {
  return (
    <button
      className={`flex items-center px-3 h-8 rounded-md ${className}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;
