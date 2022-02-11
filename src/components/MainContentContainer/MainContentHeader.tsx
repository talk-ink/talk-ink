import React from "react";

import Button from "components/Button/Button";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate, useParams } from "react-router";

type Props = React.PropsWithChildren<{
  channel: string;
  title: string;
  thread?: boolean;
  onBackClick?: () => void;
  from?: string;
  showTitle?: boolean;
  leftContent?: React.ReactNode;
}>;

function MainContentHeader({
  channel,
  title,
  thread,
  onBackClick = () => {},
  from,
  showTitle = false,
  leftContent,
}: Props) {
  const navigate = useNavigate();
  const params = useParams();

  const backButtonHandler = (): string => {
    if (from) {
      return `/a/${params.workspaceId}/${from}`;
    }
    return `/a/${params.workspaceId}/ch/${params.channelId}`;
  };

  return (
    <div className="w-full py-4 md:px-3 sticky top-0 grid grid-cols-3 border-b border-b-neutral-100 bg-white z-50">
      <div className="grid-cols-1">
        <Button
          className=" hover:bg-neutral-200 flex items-center"
          onClick={() => {
            onBackClick();
            navigate(backButtonHandler());
          }}
        >
          <HiChevronLeft size={18} className="text-neutral-500 mr-2 " />
          <p className="text-xs text-neutral-500 font-medium">
            {from === "inbox" ? "Inbox" : channel}
          </p>
        </Button>
      </div>
      <div className="flex items-center justify-center grid-cols-1">
        {showTitle && (
          <h1 className="text-md font-bold max-w-md overflow-hidden text-ellipsis whitespace-nowrap animate-easeOpacity">
            {title}
          </h1>
        )}
      </div>
      {thread && (
        <div className="grid-cols-1 flex items-center justify-end">
          {leftContent}
        </div>
      )}
    </div>
  );
}

export default MainContentHeader;
