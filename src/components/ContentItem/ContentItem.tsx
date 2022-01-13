import React, { Dispatch, SetStateAction } from "react";

import { BiDotsHorizontalRounded, BiEdit, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";

import IconButton from "components/Button/IconButton";
import { Thread } from "types";
import Popup from "components/Popup/Popup";
import MenuItem from "components/Menu/MenuItem";
import Menu from "components/Menu/Menu";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  dataSource: Thread | null | undefined;
  setSelectedThread?: Dispatch<SetStateAction<Thread | null | undefined>>;
  otherButton?: React.ReactNode;
  isRead?: boolean;
}>;

function ContentItem({
  onClick = () => {},
  dataSource,
  setSelectedThread,
  otherButton,
  isRead,
}: Props) {
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
      <div className="flex items-center justify-between px-3 hover:bg-cyan-50 rounded-xl border-l-2 border-transparent hover:border-cyan-800 group">
        <button
          className="flex items-start md:items-center w-full py-5 "
          onClick={onClick}
        >
          <div className="flex items-center">
            <div
              className={`h-3 w-3 ${
                !isRead ? "bg-cyan-600" : "bg-transparent"
              } rounded-full mr-2`}
            ></div>
            <NameInitial
              name={getNameInitial(dataSource.createdBy?.firstName)}
              className="mr-4"
            />
          </div>
          <div>
            <div className="flex flex-col items-start md:flex-row md:items-center">
              <p
                className={`font-body text-sm mr-2 ${
                  dataSource?.draft && "text-blue-500"
                }`}
              >
                {dataSource?.draft ? "Draft" : dataSource.name}
              </p>
              <span
                className={`${
                  dataSource.draft && "hidden"
                } text-xs text-neutral-500`}
              >
                <ReactMoment fromNow>
                  {dataSource?.updatedAt || dataSource?.createdAt}
                </ReactMoment>
              </span>
            </div>
            <div className="text-left w-64 md:w-full truncate md:text-clip md:whitespace-nowrap max-w-3xl text-xs text-neutral-500 pr-2">
              <small className=" text-xs text-neutral-500">
                {dataSource?.draft ? "Me: " : ""}
                {dataSource.content}
              </small>
            </div>
          </div>
        </button>
        <div className="flex active:flex group-hover:flex gap-2">
          {otherButton}
          <Popup
            content={
              <div>
                <Menu>
                  <MenuItem
                    icon={<BiTrash size={20} className="text-neutral-400" />}
                    title="Delete thread..."
                    onClick={() => {
                      setSelectedThread(dataSource);
                    }}
                  />
                  {/* <MenuItem
                    icon={<BiEdit size={20} className="text-neutral-400" />}
                    title="Edit thread title..."
                  /> */}
                </Menu>
              </div>
            }
          >
            <IconButton>
              <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
            </IconButton>
          </Popup>
        </div>
      </div>
    </div>
  );
}

export default ContentItem;
