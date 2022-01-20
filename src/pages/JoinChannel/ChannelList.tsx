import React, { useMemo } from "react";
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
  }, [selectedChannels]);

  return (
    <button
      className="w-full outline-none border-b border-neutral-100 first:border-t py-3 px-2 flex items-center justify-between"
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
          className={`h-5 w-5 border border-indigo-500 ${
            active && "bg-indigo-500"
          } rounded-full`}
        ></div>
      </div>
    </button>
  );
}

export default ChannelList;
