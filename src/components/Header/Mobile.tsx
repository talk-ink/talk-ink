import React from "react";

import { BiHash, BiLock, BiMenu, BiTrash } from "react-icons/bi";

import { AiOutlineInbox, AiOutlineSearch } from "react-icons/ai";
import { useSidebar } from "pages/Dashboard";
import { useMediaQuery } from "react-responsive";

type Props = {
  menu?: React.ReactNode;
  header?: string;
  subHeader?: string;
  privacy?: "public" | "private";
  type?: "inbox" | "search" | "channel" | "trash";
};

function MobileHeader({
  menu,
  header,
  subHeader,
  privacy = "public",
  type,
}: Props) {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSidebarOpen, setIsSidebarOpen] = useSidebar();

  let Icon = BiHash;

  switch (privacy) {
    case "public":
      if (type) {
        switch (type) {
          case "inbox":
            Icon = AiOutlineInbox;
            break;
          case "search":
            Icon = AiOutlineSearch;
            break;
          case "trash":
            Icon = BiTrash;
            break;

          default:
            break;
        }
      }
      break;

    case "private":
      Icon = BiLock;
      break;

    default:
      break;
  }

  return (
    <div
      className={`fixed h-16 w-full border-b border-neutral-200 ${
        isMobile ? "flex" : "hidden"
      } items-center justify-between px-4 bg-white z-30`}
    >
      <div className="flex items-center gap-4">
        <BiMenu
          size={28}
          className="text-slate-800"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 items-center -ml-[3px]">
            {privacy === "public" && (
              <Icon size={18} className="text-slate-700" />
            )}
            {privacy === "private" && (
              <Icon size={18} className="text-slate-400" />
            )}
            <h1 className="text-lg font-semibold whitespace-nowrap max-w-[10rem] overflow-hidden text-ellipsis">
              {header}
            </h1>
          </div>
          <p className="text-sm text-slate-500 whitespace-nowrap max-w-[15rem] overflow-hidden text-ellipsis">
            {subHeader}
          </p>
        </div>
      </div>
      <div>{menu}</div>
    </div>
  );
}

export default MobileHeader;
