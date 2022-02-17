import React, { useEffect, useMemo } from "react";

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
import { useNavigate, useParams } from "react-router";
import { useLongPress, LongPressDetectEvents } from "use-long-press";
import { decode } from "html-entities";

import IconButton from "components/Button/IconButton";
import MenuItem from "components/Menu/MenuItem2";
import NameInitial from "components/Avatar/NameInitial";
import {
  editorToHTML,
  getNameInitial,
  getShortName,
  parseContent,
} from "utils/helper";
import Divider from "components/Divider/Divider";
import Avatar from "components/Avatar/Avatar";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";

import { addReadThread, deleteReadThread } from "features/auth";
import { Channel, Member, Thread } from "types";
import logoImage from "assets/image/logo512.png";
import { useRemirror } from "@remirror/react";
import { htmlToProsemirrorNode } from "remirror";
import { extensions } from "components/Remirror/extensions";
import { deleteThread, updateThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { BsArrowUpCircle } from "react-icons/bs";
import { useMediaQuery } from "react-responsive";

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
  from?: "regular" | "trash" | "inbox";
}>;

function ContentItem({
  onClick = () => {},
  dataSource,
  setSelectedThread,
  otherButton,
  isRead,
  from = "regular",
}: Props) {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const [showToast] = useToast();
  const dispatch = useAppDispatch();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const channel = useAppSelector((state) => state.channel);
  const navigate = useNavigate();
  const isFromTalkink = dataSource.name === "Welcome to Talk.ink";

  const channelData: Channel = useMemo(() => {
    return channel.channels.find(
      (data) => data._id === dataSource?.channel?.[0]
    );
  }, [channel.channels, dataSource?.channel]);

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

  const {
    state: commentState,
    setState: setCommentState,
    manager,
  } = useRemirror({
    extensions,
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(
      dataSource.comments?.[dataSource.comments?.length - 1]?.content
    ),
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

  const getCreatedBy = (id: string): Member => {
    return member?.members?.find((data) => data._id === id);
  };

  const threadBind = useLongPress(
    () => {
      setSelectedThread({ thread: dataSource, type: "menu" });
      window.navigator.vibrate([20]);
    },
    {
      detect: LongPressDetectEvents.TOUCH,
      cancelOnMovement: true,
    }
  );

  const handleTime = () => {
    if (from === "inbox") {
      return !dataSource?.lastActionAt
        ? dataSource?.updatedAt || dataSource?.createdAt
        : dataSource?.lastActionAt;
    }
    return dataSource?.updatedAt || dataSource?.createdAt;
  };

  const threadListSubtitle = () => {
    if (dataSource?.comments?.length === 0) return editorToHTML(state);

    const lastComment = dataSource.comments?.[dataSource?.comments?.length - 1];
    const commentCreatedBy = lastComment?.createdBy?._id
      ? lastComment.createdBy
      : getCreatedBy(`${lastComment?.createdBy}`);

    if (dataSource?._id === "61fa35291fb5d50e29211f28") {
    }

    if (!commentCreatedBy) return;

    if (lastComment?.isOpenedComment)
      return `${getShortName(
        commentCreatedBy.firstName
      )} reopened this thread.`;

    return `${getShortName(commentCreatedBy.firstName)} : ${decode(
      editorToHTML(commentState)
    )}`;
  };

  useEffect(() => {
    if (dataSource?.comments?.length > 0) {
      setCommentState(
        manager.createState({
          stringHandler: htmlToProsemirrorNode,
          content: parseContent(
            dataSource.comments?.[dataSource.comments?.length - 1]?.content
          ),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.comments]);

  return (
    <div
      className="
    cursor-pointer
    hover:before:bg-transparent
    hover:after:bg-transparent"
      {...threadBind}
    >
      <div className="flex items-center justify-between pr-5 md:pr-3 md:px-3 hover:bg-indigo-50 rounded-xl border-transparent group ">
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
              } rounded-full mr-2 ${isMobile ? "hidden" : ""}`}
            ></div>
            <div className={`ml-4 md:ml-0 mr-4 relative`}>
              {isFromTalkink && (
                <Avatar
                  src={logoImage}
                  size={isMobile ? "large" : "medium"}
                  alt={getNameInitial("Talk Ink")}
                />
              )}
              {!isFromTalkink && (
                <>
                  {dataSource.createdBy?.avatar?.[0]?.url ? (
                    <Avatar
                      src={dataSource.createdBy?.avatar?.[0]?.url}
                      size={isMobile ? "large" : "medium"}
                      alt={getNameInitial(dataSource.createdBy?.firstName)}
                    />
                  ) : (
                    <NameInitial
                      name={getNameInitial(dataSource.createdBy?.firstName)}
                      size={isMobile ? "large" : "medium"}
                    />
                  )}
                </>
              )}
              {dataSource?.isClosed && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                  <BiCheck size={10} className="text-white font-bold" />
                </div>
              )}
              {!dataSource?.isClosed &&
                !isRead &&
                !dataSource?.draft &&
                isMobile && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-indigo-500 border border-white rounded-full flex items-center justify-center"></div>
                )}
            </div>
          </div>
          <div className="w-full md:w-auto">
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
                <ReactMoment
                  fromNow
                  locale="en"
                  format="LT"
                  titleFormat="DD MMMM YYYY, LT"
                  withTitle
                >
                  {handleTime()}
                </ReactMoment>
              </span>
            </div>
            <div className="text-left md:table md:table-fixed w-full md:text-xs text-neutral-500 pr-2">
              {!dataSource.isClosed && (
                <>
                  <small className="text-sm md:text-xs text-neutral-500 md:table-cell md:truncate line-clamp-2">
                    {dataSource?.draft ? "Me: " : ""}

                    {/* {dataSource.comments?.length > 0
                      ? `${getShortName(
                          getCreatedBy(
                            `${
                              dataSource.comments?.[
                                dataSource.comments?.length - 1
                              ]?.createdBy
                            }`
                          ).firstName
                        )} : ${editorToHTML(commentState)}`
                      : editorToHTML(state)} */}
                    {threadListSubtitle()}
                  </small>
                </>
              )}
              {dataSource.isClosed && (
                <small className="text-sm md:text-xs text-neutral-500 table-cell truncate">
                  {closedBy?.firstName} closed this thread.
                </small>
              )}
            </div>
          </div>
        </button>

        <Menu as="div" className="relative hidden md:block">
          {({ open }) => (
            <>
              <div
                className={`hidden ${
                  from !== "inbox" || open ? "md:hidden" : "md:flex"
                } md:group-hover:hidden items-center justify-end`}
              >
                <div className="rounded-full border border-indigo-200 px-2 py-0.5">
                  <p className="text-xs text-slate-600">
                    {channelData?.name}
                    <span className="ml-1 font-semibold text-indigo-500">
                      #
                    </span>
                  </p>
                </div>
              </div>
              <div
                className={`hidden ${
                  open ? "md:flex" : ""
                } group-hover:flex gap-2 items-center`}
              >
                {otherButton}
                <>
                  {!dataSource?.draft && (
                    <div className="flex">
                      <Menu.Button as="div">
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
                    <Menu.Items
                      static
                      className="menu-container right-0 top-full"
                    >
                      {["regular", "inbox"].includes(from) && (
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
                                <BiCheck
                                  size={20}
                                  className="text-neutral-400"
                                />
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
                                    navigate(
                                      `/a/${params.workspaceId}/ch/${dataSource.channel?.[0]}/te/${dataSource?._id}`
                                    );
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
              </div>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
}

export default ContentItem;
