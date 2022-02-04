import React from "react";

import { Menu } from "@headlessui/react";

type TProps = React.PropsWithChildren<{
  title?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}>;

function MenuItem({
  title,
  onClick = () => {},
  icon,
  disabled,
  active,
}: TProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active: menuActive, disabled }) => (
        <button
          className={`rounded-md ${
            disabled ? "opacity-50" : active || menuActive ? "bg-indigo-50" : ""
          } flex justify-between p-2 w-full`}
          onClick={onClick}
          disabled={disabled}
        >
          <div className="flex-grow-0 flex items-center gap-2">
            {icon}
            <p className="text-sm -mb-1 -mt-1">{title}</p>
          </div>
          <div></div>
        </button>
      )}
    </Menu.Item>
  );
}

export default MenuItem;
