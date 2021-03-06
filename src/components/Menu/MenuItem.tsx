import React from "react";

type TProps = React.PropsWithChildren<{
  title?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}>;

function MenuItem({
  title,
  onClick = () => {},
  icon,
  disabled,
  className,
}: TProps) {
  return (
    <button
      className={`rounded-md ${
        !disabled ? "hover:bg-indigo-50" : "opacity-50"
      } flex justify-between p-2 outline-none w-full ${className}`}
      onClick={onClick}
      disabled={disabled}
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
