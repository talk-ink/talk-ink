import React, { useState } from "react";
import { IReaction } from "types";

type TProps = {
  data: IReaction;
  active?: boolean;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
};

function Reaction({ data, active, onClick, tooltip, disabled }: TProps) {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <div className="relative">
      {showTooltip && tooltip && (
        <div className="bg-slate-700 absolute top-0 left-1/2 transform -translate-y-full -translate-x-1/2 p-1 px-2 -mt-1 rounded">
          <p className="text-xs text-white whitespace-nowrap">{tooltip}</p>
        </div>
      )}
      <button
        className={`py-1 px-2 flex items-center gap-2 rounded-full border border-indigo-200 outline-none hover:border-indigo-500 hover:bg-indigo-100 ${
          active ? "border-indigo-500 bg-indigo-100" : ""
        } ${disabled ? "cursor-default" : ""} `}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <p>{data.emoji}</p>
        <p className="text-xs font-semibold">{data?.users?.length}</p>
      </button>
    </div>
  );
}

export default Reaction;
