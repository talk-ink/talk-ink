import React from "react";
import { BiUserPlus } from "react-icons/bi";
import { SettingsModalHeader } from "utils/text-constants";

type TProps = React.PropsWithChildren<{
  icon: React.ReactNode;
  type: string;
  onClick?: () => void;
  className?: string;
  active?: string;
}>;

const SidebarButton = ({
  icon,
  type,
  onClick = () => {},
  className,
  active,
}: TProps) => {
  return (
    <button
      className={`cursor-pointer w-full rounded ${
        active === type && "bg-indigo-100"
      } hover:bg-neutral-100 flex items-center justify-between group ${className} outline-none`}
      onClick={onClick}
    >
      <div className={`w-full flex items-center text-sm pl-3 h-8`}>
        {icon}
        <p className="ml-2">{SettingsModalHeader[type]}</p>
      </div>
    </button>
  );
};

export default SidebarButton;
