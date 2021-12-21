import React from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
}>;

function Button({ children, className }: Props) {
  return (
    <button className={`flex items-center px-3 h-8 rounded-md ${className}`}>
      {children}
    </button>
  );
}

export default Button;
