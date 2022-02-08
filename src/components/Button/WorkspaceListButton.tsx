import React, { useState } from "react";
import { Workspace } from "types";

type TProps = {
  data: Workspace;
  onClick?: () => void;
};

function WorkspaceListButton({ data, onClick = () => {} }: TProps) {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <button
      className="w-full outline-none rounded-md hover:bg-indigo-50 flex justify-between p-2"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="h-8 w-8 rounded bg-indigo-500 mr-2 text-white flex items-center justify-center overflow-hidden">
          {(!data.logo || loading) && (
            <p className="text-white uppercase font-bold text-sm">
              {data.name?.[0]}
            </p>
          )}
          {data.logo && !loading && (
            <img
              src={data?.logo}
              alt="logo"
              className="h-full w-full object-cover"
              onLoad={() => {
                setLoading(false);
              }}
            />
          )}
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
