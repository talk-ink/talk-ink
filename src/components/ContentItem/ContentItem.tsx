import React, { Dispatch, SetStateAction } from "react";

import {
  BiCheck,
  BiCircle,
  BiDotsHorizontalRounded,
  BiEdit,
  BiTrash,
} from "react-icons/bi";
import ReactMoment from "react-moment";

import IconButton from "components/Button/IconButton";
import { Thread } from "types";
import Popup from "components/Popup/Popup";
import MenuItem from "components/Menu/MenuItem";
import Menu from "components/Menu/Menu";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";
import Divider from "components/Divider/Divider";
import { useAppDispatch } from "hooks/useAppDispatch";
import { addReadThread, deleteReadThread } from "features/auth";
import { kontenbase } from "lib/client";
import { useAppSelector } from "hooks/useAppSelector";

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
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const handleReadUnread = async ({ type }: { type: "read" | "unread" }) => {
    try {
      console.log(type);
      switch (type) {
        case "read":
          await kontenbase
            .service("Users")
            .link(auth.user.id, { readedThreads: dataSource._id });
          dispatch(addReadThread(dataSource._id));
          break;
        case "unread":
          await kontenbase
            .service("Users")
            .unlink(auth.user.id, { readedThreads: dataSource._id });
          dispatch(deleteReadThread(dataSource._id));
          break;

        default:
          break;
      }
    } catch (error: any) {
      console.log("err", error);
    }
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
      <div className="flex items-center justify-between px-3 hover:bg-cyan-50 rounded-xl border-transparent group">
        <button
          className="flex items-start md:items-center w-full py-5 relative z-0 "
          onClick={onClick}
        >
          <div className="h-full w-1 absolute top-0 -left-3 rounded-l-xl group-hover:bg-cyan-700"></div>
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
                } ${!dataSource?.draft && !isRead && "font-semibold"}`}
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
            <div className="text-left w-52 md:w-full truncate  md:whitespace-nowrap 2xl:max-w-4xl xl:max-w-2xl md:max-w-xl text-xs text-neutral-500 pr-2">
              <small className=" text-xs text-neutral-500">
                {dataSource?.draft ? "Me: " : ""}
                {dataSource.content?.replace(/[^a-zA-Z ]/g, "")}
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
                  {isRead && (
                    <MenuItem
                      icon={<BiCircle size={20} className="text-neutral-400" />}
                      title="Mark unread"
                      onClick={() => {
                        handleReadUnread({ type: "unread" });
                      }}
                    />
                  )}
                  {!isRead && (
                    <MenuItem
                      icon={<BiCheck size={20} className="text-neutral-400" />}
                      title="Mark read"
                      onClick={() => {
                        handleReadUnread({ type: "read" });
                      }}
                    />
                  )}
                  <Divider />
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
