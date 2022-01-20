import React from "react";
import { HiOutlineHashtag } from "react-icons/hi";
import { Channel } from "types";

type TProps = {
  onClick?: () => void;
  data?: Channel;
};

function BrowseChannelList({ onClick, data }: TProps) {
  return (
    <button
      className="w-full p-3 hover:bg-indigo-100 rounded outline-none relative overflow-hidden mt-1 first:mt-0 group"
      onClick={onClick}
    >
      <div
        className={`h-full absolute left-0 top-0 w-[2px] group-hover:bg-indigo-500`}
      ></div>
      <div className="flex gap-3">
        <HiOutlineHashtag size={16} className="text-indigo-500" />
        <div className="flex flex-col items-start">
          <p className="text-sm">{data?.name}</p>
          {data?.description && (
            <p className="text-sm text-gray-400 mt-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
              {data?.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default BrowseChannelList;
