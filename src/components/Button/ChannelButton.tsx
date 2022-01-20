import { Menu } from "@headlessui/react";
import MenuItem from "components/Menu/MenuItem2";
import React, { Dispatch, SetStateAction } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { HiOutlineHashtag } from "react-icons/hi";

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
              <Menu.Button as={React.Fragment}>
                <IconButton
                  className={`${open ? "flex" : "hidden"} group-hover:flex`}
                  size="medium"
                >
                  <BiDotsVerticalRounded
                    size={16}
                    className="text-neutral-500"
                  />
                </IconButton>
              </Menu.Button>
              <IconButton
                className={`${open ? "flex" : "hidden"} group-hover:flex`}
                size="medium"
                onClick={onAddChannelClick}
              >
                <FaPlus size={10} className="text-neutral-500" />
              </IconButton>
            </div>
            {open && (
              <Menu.Items
                static
                className="absolute right-0 w-60 shadow rounded-xl bg-white p-3 z-10 outline-none mt-2"
              >
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
