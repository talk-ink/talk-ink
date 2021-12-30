import React from "react";
import { Workspace } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  data: Workspace;
  onClick?: () => void;
};

function WorkspaceListButton({ data, onClick = () => {} }: TProps) {
  return (
    <button
      className="w-full outline-none rounded-md hover:bg-cyan-50 flex justify-between p-2"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="h-8 w-8 rounded bg-cyan-500 mr-2 text-white flex items-center justify-center">
          <p className="text-lg uppercase">{getNameInitial(data.name)}</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm">{data.name}</p>
          <small className="text-xs text-neutral-500">
            {data.peoples.length} members
          </small>
        </div>
      </div>
      <div></div>
    </button>
  );
}

export default WorkspaceListButton;
