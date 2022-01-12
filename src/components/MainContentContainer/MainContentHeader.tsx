import Button from "components/Button/Button";
import { createBrowserHistory } from "history";
import React from "react";
import { HiChevronLeft } from "react-icons/hi";
import { useNavigate, useParams } from "react-router";

type Props = React.PropsWithChildren<{
  channel: string;
  title: string;
  thread?: boolean;
  onBackClick?: () => void;
}>;

function MainContentHeader({
  channel,
  title,
  thread,
  onBackClick = () => {},
}: Props) {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <div className="w-full py-4 md:px-3 sticky top-0 grid grid-cols-3 border-b border-b-neutral-100 bg-white z-1">
      <div className="grid-cols-1">
        <Button
          className=" hover:bg-neutral-200 flex items-center"
          onClick={() => {
            onBackClick();
            navigate(`/a/${params.workspaceId}/ch/${params.channelId}`);
          }}
        >
          <HiChevronLeft size={18} className="text-neutral-500 mr-2 " />
          <p className="text-xs text-neutral-500 font-medium">{channel}</p>
        </Button>
      </div>
      <div className="flex items-center justify-center grid-cols-1">
        <h1 className="text-md font-bold">{title}</h1>
      </div>
      {thread && (
        <div className="grid-cols-1 flex items-center justify-end"></div>
      )}
    </div>
  );
}

export default MainContentHeader;
