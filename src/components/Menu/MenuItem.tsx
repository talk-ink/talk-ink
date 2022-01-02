import React from "react";
import { BiTrash } from "react-icons/bi";

type TProps = React.PropsWithChildren<{
  title?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}>;

function MenuItem({ title, onClick = () => {}, icon }: TProps) {
  return (
    <button
      className="rounded-md hover:bg-cyan-50 flex justify-between p-2"
      onClick={onClick}
    >
      <div className="flex-grow-0 flex items-center gap-2">
        {icon}
        <p className="text-sm -mb-1 -mt-1">{title}</p>
      </div>
      <div></div>
    </button>
  );
}

export default MenuItem;
