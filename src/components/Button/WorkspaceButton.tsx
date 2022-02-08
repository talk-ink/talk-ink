import React, { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { Workspace } from "types";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  workspaceData?: Workspace;
}>;

function WorkspaceButton({ onClick = () => {}, workspaceData }: Props) {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <button
      className="flex items-center hover:bg-neutral-200 px-3 h-10 rounded-md"
      onClick={onClick}
    >
      <div className="w-6 h-6 bg-[#a8a8a8] rounded-md flex items-center justify-center overflow-hidden">
        {(!workspaceData?.logo || loading) && (
          <p className="text-white uppercase font-bold text-sm">
            {workspaceData?.name?.[0]}
          </p>
        )}
        {workspaceData?.logo && !loading && (
          <img
            src={workspaceData?.logo}
            alt="logo"
            className="h-full w-full object-cover"
            onLoad={() => {
              setLoading(false);
            }}
          />
        )}
      </div>
      <p className="font-bold px-2 text-sm">{workspaceData?.name}</p>
      <HiChevronDown className="text-neutral-400 -mb-1" />
    </button>
  );
}

export default WorkspaceButton;
