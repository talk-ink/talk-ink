import React from "react";

import { AiOutlineInbox, AiOutlineSearch } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import {
  HiOutlineBookmark,
  HiOutlineChat,
  HiOutlineHashtag,
} from "react-icons/hi";
import { NavLink } from "react-router-dom";

type SidebarType = "search" | "inbox" | "saved" | "messages" | "channel";

type Props = React.PropsWithChildren<{
  type: SidebarType;
  name?: string;
  link: string;
  isDefault?: boolean;
  count?: number | string;
}>;

function SidebarList({ type, name, link, isDefault, count }: Props) {
  let Icon = AiOutlineInbox;
  let showOption = type === "channel";

  switch (type) {
    case "search":
      Icon = AiOutlineSearch;
      break;

    case "inbox":
      Icon = AiOutlineInbox;
      break;
    case "saved":
      Icon = HiOutlineBookmark;
      break;
    case "messages":
      Icon = HiOutlineChat;
      break;
    case "channel":
      Icon = HiOutlineHashtag;
      break;

    default:
      Icon = AiOutlineInbox;
      break;
  }
  return (
    <div
      className={`cursor-pointer w-full rounded hover:bg-neutral-100 flex items-center justify-between relative group`}
    >
      <NavLink
        to={link}
        className={({ isActive }) =>
          `w-full flex items-center text-sm pl-3 h-8`
        }
      >
        <Icon
          size={20}
          className={`mr-2 text-gray-400 ${
            type === "channel" && isDefault && "text-cyan-500"
          }`}
        />
        <p>{name}</p>
      </NavLink>
      <div
        className={`h-7 w-8 flex items-center justify-center ${
          showOption && "group-hover:hidden"
        }`}
      >
        <p className="text-neutral-400 text-xs">{count}</p>
      </div>
      {showOption && (
        <button className="hidden h-7 w-8 group-hover:flex items-center justify-center hover:bg-neutral-300 rounded-md z-10">
          <BiDotsHorizontalRounded size={18} className="text-neutral-500" />
        </button>
      )}
    </div>
  );
}

export default SidebarList;
