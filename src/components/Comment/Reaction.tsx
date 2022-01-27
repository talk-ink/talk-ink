import React from "react";
import { IReaction } from "types";

type TProps = {
  data: IReaction;
  active?: boolean;
  onClick?: () => void;
};

function Reaction({ data, active, onClick }: TProps) {
  return (
    <button
      className={`py-1 px-2 flex items-center gap-2 rounded-full border border-indigo-200 outline-none hover:border-indigo-500 hover:bg-indigo-100 ${
        active ? "border-indigo-500 bg-indigo-100" : ""
      }`}
      onClick={onClick}
    >
      <p>{data.emoji}</p>
      <p className="text-xs font-semibold">{data?.users?.length}</p>
    </button>
  );
}

export default Reaction;
