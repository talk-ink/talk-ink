import React, { Dispatch, SetStateAction, useMemo } from "react";

import IconButton from "components/Button/IconButton";
import { Menu } from "@headlessui/react";
import MenuItem from "components/Menu/MenuItem2";

import { AiOutlineInbox, AiOutlineSearch } from "react-icons/ai";
import {
  BiDotsHorizontalRounded,
  BiEditAlt,
  BiInfoCircle,
  BiLock,
  BiLogOut,
  BiTrash,
  BiUserPlus,
} from "react-icons/bi";
import {
  HiOutlineBookmark,
  HiOutlineChat,
  HiOutlineHashtag,
} from "react-icons/hi";
import { NavLink, useLocation, useParams } from "react-router-dom";

import { Channel } from "types";

type SidebarType =
  | "search"
  | "inbox"
  | "saved"
  | "messages"
  | "channel"
  | "trash";

type Props = React.PropsWithChildren<{
  type: SidebarType;
  name?: string;
  link: string;
  isDefault?: boolean;
  count?: number | string;
  leaveModalHandler?: (channel: Channel) => void;
  editModalHandler?: (channel: Channel) => void;
  channelInfoHandler?: (channel: Channel) => void;
  addMemberHandler?: (channel: Channel) => void;
  data?: Channel;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isAdmin?: boolean;
}>;

function SidebarList({
  type,
  name,
  link,
  isDefault,
  count = 0,
  leaveModalHandler,
  editModalHandler,
  data,
  setIsSidebarOpen,
  channelInfoHandler,
  addMemberHandler,
  isAdmin,
}: Props) {
  let Icon = AiOutlineInbox;
  let showOption = type === "channel";

  const params = useParams();
  const { pathname } = useLocation();

  let isActive = useMemo(() => {
    if (!data) {
      return pathname.includes(type);
    } else {
      return params.channelId === data?._id;
    }
  }, [params, pathname, data, type]);

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
    case "trash":
      Icon = BiTrash;
      break;
    default:
      Icon = AiOutlineInbox;
      break;
  }
  return (
    <div
      className={`cursor-pointer w-full ${
        isActive && "bg-indigo-100"
      } rounded hover:bg-neutral-100 flex items-center justify-between group`}
    >
      <NavLink
        to={link}
        className={({ isActive }) =>
          `w-full flex items-center text-sm pl-3 h-8`
        }
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className="relative">
          <Icon
            size={20}
            className={`mr-2 text-gray-400 ${
              type === "channel" && isDefault && "text-gray-400"
            }`}
          />
          <div
            className={`absolute top-0 left-0 h-2 w-2 ${
              type === "inbox" && count > 0 ? "bg-green-600" : "bg-transparent"
            } rounded-full mr-2`}
          ></div>
        </div>
        <p className="max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
          {name}
        </p>
        {data?.privacy === "private" && (
          <BiLock size={16} className={`ml-2 text-gray-400`} />
        )}
      </NavLink>

      {showOption && (
        <Menu as="div" className="relative">
          {({ open }) => (
            <>
              <div className="flex items-center">
                <div
                  className={`h-7 w-8 flex items-center justify-center ${
                    showOption
                      ? `${open ? "hidden" : ""} group-hover:hidden`
                      : ""
                  }`}
                >
                  <p className="text-neutral-400 text-xs">{count}</p>
                </div>
                <Menu.Button as={React.Fragment}>
                  <IconButton
                    className={`${open ? "flex" : "hidden"} group-hover:flex`}
                    size="medium"
                  >
                    <BiDotsHorizontalRounded
                      size={18}
                      className="text-neutral-500"
                    />
                  </IconButton>
                </Menu.Button>
              </div>
              {open && (
                <Menu.Items static className="menu-container origin-top-right">
                  {isAdmin && (
                    <MenuItem
                      icon={
                        <BiUserPlus size={20} className="text-neutral-400" />
                      }
                      onClick={() => {
                        addMemberHandler(data);
                      }}
                      title="Add members"
                    />
                  )}
                  <MenuItem
                    icon={
                      <BiInfoCircle size={20} className="text-neutral-400" />
                    }
                    onClick={() => {
                      channelInfoHandler(data);
                    }}
                    title="Channel information"
                  />
                  {isAdmin && (
                    <MenuItem
                      icon={
                        <BiEditAlt size={20} className="text-neutral-400" />
                      }
                      onClick={() => {
                        editModalHandler(data);
                      }}
                      title="Edit channel"
                    />
                  )}
                  <MenuItem
                    icon={<BiLogOut size={20} className="text-neutral-400" />}
                    onClick={() => {
                      leaveModalHandler(data);
                    }}
                    title="Leave channel"
                  />
                </Menu.Items>
              )}
            </>
          )}
        </Menu>
      )}
      {!showOption && (
        <div className={`h-7 w-8 flex items-center justify-center`}>
          <p className="text-neutral-400 text-xs">{count === 0 ? "" : count}</p>
        </div>
      )}
    </div>
  );
}

export default SidebarList;
