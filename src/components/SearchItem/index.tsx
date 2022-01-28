import { useMemo } from "react";

import ReactMoment from "react-moment";

import Avatar from "components/Avatar/Avatar";
import NameInitial from "components/Avatar/NameInitial";

import { useAppSelector } from "hooks/useAppSelector";
import { Member, SearchResponse } from "types";
import { getNameInitial } from "utils/helper";

type TProps = {
  dataSource: SearchResponse;
  onClick?: () => void;
  search?: string;
};

function SearchItem({ dataSource, onClick, search }: TProps) {
  const member = useAppSelector((state) => state.member);

  const createdByData: Member = useMemo(() => {
    return member.members.find((data) => data._id === dataSource.createdById);
  }, [member.members, dataSource]);

  const getHighlightedText = ({
    text,
    className,
  }: {
    text: string;
    className: string;
  }) => {
    if (!search) return <span>{text}</span>;

    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return (
      <span>
        {parts.map((part) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <span className={className}>{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
      className="
cursor-pointer
hover:before:bg-transparent
hover:after:bg-transparent
before:block
before:w-full
before:h-[1px]
before:bg-neutral-200
last:after:block
last:after:w-full
last:after:h-[1px]
last:after:bg-neutral-200
"
    >
      <div className="flex items-center justify-between md:px-3 hover:bg-indigo-50 rounded-xl border-transparent group">
        <button
          className="flex items-start md:items-center w-full py-5 relative z-0 "
          onClick={onClick}
        >
          <div className="h-full w-1 absolute top-0 -left-3 rounded-l-xl group-hover:bg-indigo-500"></div>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2`}></div>
            <div className="mr-4">
              {createdByData?.avatar?.[0]?.url ? (
                <Avatar src={createdByData?.avatar?.[0]?.url} />
              ) : (
                <NameInitial name={getNameInitial(createdByData?.firstName)} />
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-col items-start md:flex-row md:items-center">
              <p
                className={`font-body text-sm mr-2 max-w-xs overflow-hidden text-ellipsis`}
              >
                {getHighlightedText({
                  text: dataSource.title,
                  className: "bg-indigo-500 text-white px-1.5 py-1",
                })}
              </p>
              <span className={` text-xs text-neutral-500`}>
                <ReactMoment fromNow locale="en">
                  {dataSource?.thread.updatedAt || dataSource?.thread.createdAt}
                </ReactMoment>
              </span>
            </div>
            <div className="text-left table table-fixed w-full  text-xs text-neutral-500 pr-2">
              <small className=" text-xs text-neutral-500 table-cell truncate">
                {getHighlightedText({
                  text: dataSource.subTitle,
                  className: "bg-indigo-500 text-white px-1.5 py-1",
                })}
              </small>
            </div>
          </div>
        </button>
        <div className="flex active:flex group-hover:flex gap-2">
          {/* {otherButton} */}
        </div>
      </div>
    </div>
  );
}

export default SearchItem;
