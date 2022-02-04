import React, { Dispatch, SetStateAction } from "react";

import {
  BiCheck,
  BiCircle,
  BiDotsHorizontalRounded,
  BiTrash,
  BiEdit,
} from "react-icons/bi";
import ReactMoment from "react-moment";
import { Menu } from "@headlessui/react";
import { kontenbase } from "lib/client";
import { useNavigate } from "react-router";

import IconButton from "components/Button/IconButton";
import MenuItem from "components/Menu/MenuItem2";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";
import Divider from "components/Divider/Divider";
import Avatar from "components/Avatar/Avatar";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";

import { addReadThread, deleteReadThread } from "features/auth";
import { Thread } from "types";
import logoImage from "assets/image/logo512.png";

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
  const navigate = useNavigate();
  const isFromTalkink = dataSource.name === "Welcome to Talk.ink";

  const handleReadUnread = async ({ type }: { type: "read" | "unread" }) => {
    try {
      switch (type) {
        case "read":
          await kontenbase
            .service("Threads")
            .link(dataSource._id, { readedUsers: auth.user._id });
          dispatch(addReadThread(dataSource._id));
          break;
        case "unread":
          await kontenbase
            .service("Threads")
            .unlink(dataSource._id, { readedUsers: auth.user._id });
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
      <div className="flex items-center justify-between md:px-3 hover:bg-indigo-50 rounded-xl border-transparent group">
        <button
          className="flex items-start md:items-center w-full py-5 relative z-0 "
          onClick={onClick}
        >
          <div className="h-full w-1 absolute top-0 -left-3 rounded-l-xl group-hover:bg-indigo-500"></div>
          <div className="flex items-center">
            <div
              className={`h-3 w-3 ${
                !isRead && !dataSource?.draft
                  ? "bg-indigo-500"
                  : "bg-transparent"
              } rounded-full mr-2`}
            ></div>
            <div className="mr-4">
              {isFromTalkink && <Avatar src={logoImage} />}
              {!isFromTalkink && (
                <>
                  {dataSource.createdBy?.avatar?.[0]?.url ? (
                    <Avatar src={dataSource.createdBy?.avatar?.[0]?.url} />
                  ) : (
                    <NameInitial
                      name={getNameInitial(dataSource.createdBy?.firstName)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-col items-start md:flex-row md:items-center">
              <p
                className={`font-body text-sm mr-2 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap ${
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
                <ReactMoment fromNow locale="en">
                  {dataSource?.updatedAt || dataSource?.createdAt}
                </ReactMoment>
              </span>
            </div>
            <div className="text-left table table-fixed w-full  text-xs text-neutral-500 pr-2">
              <small className=" text-xs text-neutral-500 table-cell truncate">
                {dataSource?.draft ? "Me: " : ""}
                {dataSource.comments?.length > 0
                  ? `Latest : ${dataSource.comments?.[
                      dataSource.comments?.length - 1
                    ]?.content?.replace(/[^a-zA-Z0-9., ]/g, " ")}`
                  : "HAHAHAH"}
              </small>
            </div>
          </div>
        </button>
        <div className="flex active:flex group-hover:flex gap-2">
          {otherButton}
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                {!dataSource?.draft && (
                  <div className="flex">
                    <Menu.Button as={React.Fragment}>
                      <IconButton>
                        <BiDotsHorizontalRounded
                          size={24}
                          className="text-neutral-400"
                        />
                      </IconButton>
                    </Menu.Button>
                  </div>
                )}

                {open && (
                  <Menu.Items static className="menu-container right-0">
                    {isRead && (
                      <MenuItem
                        icon={
                          <BiCircle size={20} className="text-neutral-400" />
                        }
                        title="Mark unread"
                        onClick={() => {
                          handleReadUnread({ type: "unread" });
                        }}
                      />
                    )}
                    {!isRead && (
                      <MenuItem
                        icon={
                          <BiCheck size={20} className="text-neutral-400" />
                        }
                        title="Mark read"
                        onClick={() => {
                          handleReadUnread({ type: "read" });
                        }}
                      />
                    )}
                    {(dataSource.createdBy._id === auth.user._id ||
                      dataSource?.draft) &&
                      !isFromTalkink &&
                      !dataSource?.draft && <Divider />}
                    {(dataSource.createdBy._id === auth.user._id ||
                      dataSource?.draft) &&
                      !isFromTalkink &&
                      !dataSource?.draft && (
                        <>
                          <MenuItem
                            icon={
                              <BiEdit size={20} className="text-neutral-400" />
                            }
                            title="Edit thread..."
                            onClick={() => {
                              navigate(`te/${dataSource?._id}`);
                            }}
                          />
                          <MenuItem
                            icon={
                              <BiTrash size={20} className="text-neutral-400" />
                            }
                            title="Delete thread..."
                            onClick={() => {
                              setSelectedThread(dataSource);
                            }}
                          />
                        </>
                      )}
                  </Menu.Items>
                )}
              </>
            )}
          </Menu>
        </div>
      </div>
    </div>
  );
}

export default ContentItem;
