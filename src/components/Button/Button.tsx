import React from "react";

type Props = React.PropsWithChildren<{
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>;

function Button({ children, className, onClick = () => {} }: Props) {
  return (
    <button className={`flex items-center px-3 h-8 rounded-md ${className}`}>
      {children}
    </button>
  );
}

export default Button;
