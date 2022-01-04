import React from "react";
import { BiUserPlus } from "react-icons/bi";

type TProps = React.PropsWithChildren<{
  icon: React.ReactNode;
  text: string;
  type: string;
  onClick?: () => void;
  className?: string;
}>;

const MenuButton = ({
  icon,
  text,
  type,
  onClick = () => {},
  className,
}: TProps) => {
  return (
    <button
      className={`cursor-pointer w-full rounded hover:bg-neutral-100 flex items-center justify-between group ${className}`}
      onClick={onClick}
    >
      <div className={`w-full flex items-center text-sm pl-3 h-8`}>
        {icon}
        <p className="ml-2">{text}</p>
      </div>
    </button>
  );
};

export default MenuButton;
