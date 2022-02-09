import React from "react";

import { Menu } from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { HiOutlineHashtag } from "react-icons/hi";

import MenuItem from "components/Menu/MenuItem2";
import IconButton from "./IconButton";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  onBrowseChannels?: () => void;
  onAddChannelClick?: () => void;
}>;

function ChannelButton({
  onClick = () => {},
  onBrowseChannels = () => {},
  onAddChannelClick = () => {},
}: Props) {
  return (
    <div className="w-full rounded h-9 hover:bg-neutral-100 flex items-center justify-between group">
      <button
        className="pl-3 h-full w-full text-left outline-none"
        onClick={onClick}
      >
        <p className="font-bold text-xs text-neutral-500">Channels</p>
      </button>

      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <div className="flex">
              <Menu.Button as="div">
                <IconButton
                  className={`${
                    open ? "flex" : "flex md:hidden"
                  } md:group-hover:flex`}
                  size="medium"
                >
                  <BiDotsVerticalRounded
                    size={16}
                    className="text-neutral-500"
                  />
                </IconButton>
              </Menu.Button>
              <IconButton
                className={`${
                  open ? "flex" : "flex md:hidden"
                } md:group-hover:flex`}
                size="medium"
                onClick={onAddChannelClick}
              >
                <FaPlus size={10} className="text-neutral-500" />
              </IconButton>
            </div>
            {open && (
              <Menu.Items static className="menu-container right-0">
                <MenuItem
                  icon={
                    <HiOutlineHashtag size={16} className="text-neutral-400" />
                  }
                  onClick={onBrowseChannels}
                  title="Browse channels"
                />
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </div>
  );
}

export default ChannelButton;
