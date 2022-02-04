import React, { useMemo } from "react";

import {
  BiCheck,
  BiCircle,
  BiDotsHorizontalRounded,
  BiTrash,
  BiEdit,
  BiCheckCircle,
  BiRecycle,
} from "react-icons/bi";
import ReactMoment from "react-moment";
import { Menu } from "@headlessui/react";
import { kontenbase } from "lib/client";
import { useNavigate } from "react-router";
import { useLongPress, LongPressDetectEvents } from "use-long-press";

import IconButton from "components/Button/IconButton";
import MenuItem from "components/Menu/MenuItem2";
import NameInitial from "components/Avatar/NameInitial";
import { editorToHTML, getNameInitial, parseContent } from "utils/helper";
import Divider from "components/Divider/Divider";
import Avatar from "components/Avatar/Avatar";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";

import { addReadThread, deleteReadThread } from "features/auth";
import { Member, Thread } from "types";
import logoImage from "assets/image/logo512.png";
import { useRemirror } from "@remirror/react";
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from "remirror";
import { extensions } from "components/Remirror/extensions";
import { deleteThread, updateThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { BsArrowUpCircle } from "react-icons/bs";

export type SelectedThreadTypes = "delete" | "close" | "menu";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  dataSource: Thread | null | undefined;
  setSelectedThread?: React.Dispatch<
    React.SetStateAction<{
      thread: Thread;
      type: SelectedThreadTypes;
    }>
  >;
  otherButton?: React.ReactNode;
  isRead?: boolean;
  from?: "regular" | "trash";
  onHold?: () => void;
}>;

function ContentItem({
  onClick = () => {},
  dataSource,
  setSelectedThread,
  otherButton,
  isRead,
  from = "regular",
  onHold,
}: Props) {
  const [showToast] = useToast();
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
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

  const { state } = useRemirror({
    extensions,
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(dataSource.content),
  });

  const reopenThreadHandler = async () => {
    try {
      const { data, error } = await kontenbase
        .service("Threads")
        .updateById(dataSource._id, { isClosed: false });
      if (error) throw new Error(error?.message);

      if (data) {
        dispatch(updateThread({ ...dataSource, isClosed: false }));
        onClick();
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const restoreThreadHandler = async () => {
    try {
      const { data, error } = await kontenbase
        .service("Threads")
        .updateById(dataSource._id, { isDeleted: false });
      if (error) throw new Error(error?.message);

      if (data) {
        dispatch(deleteThread(dataSource));
        showToast({ message: `"${dataSource.name}" thread has been restored` });
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const closedBy: Member = useMemo(() => {
    return member?.members?.find(
      (data) => data._id === dataSource?.closedBy?.[0]
    );
  }, [dataSource?.closedBy, member.members]);

  const threadBind = useLongPress(
    () => {
      onHold();
    },
    {
      detect: LongPressDetectEvents.TOUCH,
    }
  );

  return (
    <div
      className="
    cursor-pointer
    hover:before:bg-transparent
    hover:after:bg-transparent"
      {...threadBind}
    >
      <div className="flex items-center justify-between pr-5 md:pr-0 md:px-3 hover:bg-indigo-50 rounded-xl border-transparent group ">
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
            <div className={`mr-4 ${dataSource?.isClosed ? "relative" : ""}`}>
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
              {dataSource?.isClosed && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                  <BiCheck size={10} className="text-white font-bold" />
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-row items-center justify-between md:justify-start">
              <p
                className={`font-body md:text-sm max-w-[12rem] mr-2 md:max-w-xs overflow-hidden text-left text-ellipsis whitespace-nowrap ${
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
            <div className="text-left table table-fixed w-full md:text-xs text-neutral-500 pr-2">
              {!dataSource.isClosed && (
                <small className="text-sm md:text-xs text-neutral-500 table-cell truncate">
                  {dataSource?.draft ? "Me: " : ""}
                  {/* latest juga disini */}
                  {editorToHTML(state)}
                </small>
              )}
              {dataSource.isClosed && (
                <small className="text-sm md:text-xs text-neutral-500 table-cell truncate">
                  {closedBy?.firstName} closed this thread.
                </small>
              )}
            </div>
          </div>
        </button>
        <div className="hidden md:flex active:flex group-hover:flex gap-2 items-center">
          {otherButton}
          <Menu as="div" className="relative hidden md:block">
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
                    {from === "regular" && (
                      <>
                        {isRead && (
                          <MenuItem
                            icon={
                              <BiCircle
                                size={20}
                                className="text-neutral-400"
                              />
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
                                  <BiEdit
                                    size={20}
                                    className="text-neutral-400"
                                  />
                                }
                                title="Edit thread..."
                                onClick={() => {
                                  navigate(`te/${dataSource?._id}`);
                                }}
                              />
                              <MenuItem
                                icon={
                                  <BiTrash
                                    size={20}
                                    className="text-neutral-400"
                                  />
                                }
                                title="Delete thread..."
                                onClick={() => {
                                  setSelectedThread({
                                    thread: dataSource,
                                    type: "delete",
                                  });
                                }}
                              />
                            </>
                          )}
                        {!dataSource?.isClosed && (
                          <MenuItem
                            icon={
                              <BiCheckCircle
                                size={20}
                                className="text-neutral-400"
                              />
                            }
                            title="Close thread"
                            onClick={() => {
                              setSelectedThread({
                                thread: dataSource,
                                type: "close",
                              });
                            }}
                          />
                        )}
                        {dataSource?.isClosed && (
                          <MenuItem
                            icon={
                              <BsArrowUpCircle
                                size={20}
                                className="text-neutral-400"
                              />
                            }
                            title="Reopen thread"
                            onClick={() => {
                              reopenThreadHandler();
                            }}
                          />
                        )}
                      </>
                    )}
                    {from === "trash" && (
                      <MenuItem
                        icon={
                          <BiRecycle size={20} className="text-neutral-400" />
                        }
                        title="Restore thread"
                        onClick={() => {
                          restoreThreadHandler();
                        }}
                      />
                    )}
                    {from === "trash" && (
                      <MenuItem
                        icon={
                          <BiTrash size={20} className="text-neutral-400" />
                        }
                        title="Remove from trash"
                        onClick={() => {
                          setSelectedThread({
                            thread: dataSource,
                            type: "delete",
                          });
                        }}
                      />
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
