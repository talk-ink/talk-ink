import React from "react";

import { BiDotsVerticalRounded, BiHash, BiLock, BiMenu } from "react-icons/bi";

import { useAppSelector } from "hooks/useAppSelector";

type Props = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function MobileHeader({ isSidebarOpen, setIsSidebarOpen }: Props) {
  const pageHeader = useAppSelector((state) => state.pageHeader);
  return (
    <div
      className={`fixed h-16 w-full border-b border-neutral-200 ${
        pageHeader.show ? "flex" : "hidden"
      } items-center justify-between px-4 bg-white z-30`}
    >
      <div className="flex items-center gap-4">
        <BiMenu
          size={28}
          className="text-slate-800"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            {pageHeader?.privacy === "public" && (
              <BiHash size={18} className="text-slate-400" />
            )}
            {pageHeader?.privacy === "private" && (
              <BiLock size={18} className="text-slate-400" />
            )}
            <h1 className="text-lg font-semibold ">{pageHeader.header}</h1>
          </div>
          <p className="text-sm text-indigo-500">{pageHeader.subHeader}</p>
        </div>
      </div>
      <div>
        <BiDotsVerticalRounded size={28} className="text-slate-800" />
      </div>
    </div>
  );
}

export default MobileHeader;
