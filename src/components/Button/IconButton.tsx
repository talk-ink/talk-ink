import React from "react";
import { BiMoon } from "react-icons/bi";

type Props = React.PropsWithChildren<{
  icon: any;
}>;

function IconButton() {
  return (
    <button className="flex items-center justify-center hover:bg-neutral-200 w-10 h-10 rounded-md">
      <BiMoon size={18} className="text-neutral-400" />
    </button>
  );
}

export default IconButton;
