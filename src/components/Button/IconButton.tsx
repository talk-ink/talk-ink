import React from "react";
import { BiMoon } from "react-icons/bi";

type Props = React.PropsWithChildren<{
  children: React.ReactNode;
}>;

function IconButton({ children }: Props) {
  return (
    <button className="flex items-center justify-center hover:bg-neutral-200 w-10 h-10 rounded-md">
      {children}
    </button>
  );
}

export default IconButton;
