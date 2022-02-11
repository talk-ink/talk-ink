import Avatar from "components/Avatar/Avatar";
import React from "react";
import { Member } from "types";

type Props = {
  data: Member;
  active?: boolean;
  onClick?: () => void;
};

const DirectMessageList = ({ data, active, onClick }: Props) => {
  return (
    <button
      key={data?._id}
      className={`px-3 py-1 w-full rounded flex items-center gap-2 outline-indigo-100 ${
        active
          ? "bg-indigo-400 text-white"
          : "hover:bg-indigo-50 text-slate-800"
      }`}
      onClick={onClick}
    >
      <Avatar src={data?.avatar?.[0]?.url} alt={data?.firstName} size="small" />
      <p className="text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
        {data?.firstName}
      </p>
    </button>
  );
};

export default DirectMessageList;
