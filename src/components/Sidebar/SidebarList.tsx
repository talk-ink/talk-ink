import React from "react";
import { AiOutlineInbox, AiOutlineSearch } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import {
  HiOutlineBookmark,
  HiOutlineChat,
  HiOutlineHashtag,
} from "react-icons/hi";

type SidebarType = "search" | "inbox" | "saved" | "messages" | "channel";

type Props = React.PropsWithChildren<{
  type: SidebarType;
  active?: boolean;
  title?: string;
}>;

function SidebarList({ type, active, title }: Props) {
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
    <a
      href="#"
      className={`w-full rounded h-8 ${
        active && "bg-cyan-100"
      } hover:bg-neutral-100 flex items-center justify-between group`}
    >
      <div className="flex items-center text-sm pl-3">
        <Icon
          size={20}
          className={`mr-2 text-gray-400 ${
            type === "channel" && "text-cyan-500"
          }`}
        />
        <p>{title}</p>
      </div>
      <div
        className={`h-7 w-7 flex items-center justify-center ${
          showOption && "group-hover:hidden"
        }`}
      >
        <p className="text-neutral-400 text-xs">4</p>
      </div>
      {showOption && (
        <button className="hidden h-7 w-7 group-hover:flex items-center justify-center hover:bg-neutral-300 rounded-md">
          <BiDotsHorizontalRounded size={18} className="text-neutral-500" />
        </button>
      )}
    </a>
  );
}

export default SidebarList;
