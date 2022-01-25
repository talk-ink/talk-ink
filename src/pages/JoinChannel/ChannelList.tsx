import React, { useMemo } from "react";

import { BiCheck } from "react-icons/bi";
import { HiOutlineHashtag } from "react-icons/hi";
import { Channel } from "types";

type TProps = React.PropsWithChildren<{
  data: Channel;
  onClick?: () => void;

  selectedChannels: string[];
}>;

function ChannelList({ data, onClick = () => {}, selectedChannels }: TProps) {
  const active: boolean = useMemo(() => {
    return selectedChannels.includes(data._id);
  }, [selectedChannels, data._id]);

  return (
    <button
      className="w-full outline-none border-b border-neutral-100 first:border-t-0 py-3 px-2 flex items-center justify-between hover:bg-indigo-50 rounded-sm"
      onClick={onClick}
    >
      <div className="flex items-center">
        <HiOutlineHashtag size={20} className="mr-2" />
        <div className="flex flex-col items-start">
          <p className="-mb-1">{data.name}</p>
          <small className="text-xs text-neutral-500 ">
            {data.members.length} members
          </small>
        </div>
      </div>
      <div>
        <div
          className={`h-5 w-5 border-2 border-indigo-500 ${
            active && "bg-indigo-500"
          } rounded flex items-center justify-center`}
        >
          {active && <BiCheck size={16} className="text-white font-bold" />}
        </div>
        {/* {active ? (
          <BiCheckCircle size={24} className="text-indigo-500" />
        ) : (
          <BiCircle size={24} className="text-indigo-500" />
        )} */}
      </div>
    </button>
  );
}

export default ChannelList;
