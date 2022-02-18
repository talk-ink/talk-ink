import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  BiDotsHorizontalRounded,
  BiEditAlt,
  BiMessageAltCheck,
  BiMessageAltDots,
  BiTrash,
} from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Dialog, Menu, Popover } from "@headlessui/react";
import { HiOutlineReply } from "react-icons/hi";
import { VscReactions } from "react-icons/vsc";
import Picker, { SKIN_TONE_NEUTRAL } from "emoji-picker-react";
import { useMediaQuery } from "react-responsive";
import { kontenbase } from "lib/client";
import axios from "axios";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import MenuItem from "components/Menu/MenuItem2";
import IconButton from "components/Button/IconButton";
import SubComment from "./SubComment";
import SubCommentForm from "./SubCommentForm";

import { IComment, IReaction, Member, Thread } from "types";
import {
  deleteComment,
  updateComment,
} from "features/threads/slice/asyncThunk";
import { addSubCommentToComment } from "features/threads/slice";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import NameInitial from "components/Avatar/NameInitial";
import { draft, editorToHTML, frontendUrl, getNameInitial } from "utils/helper";
import { notificationUrl } from "utils/helper";
import Reaction from "./Reaction";
import { useRemirror } from "@remirror/react";
import { extensions } from "components/Remirror/extensions";
import { htmlToProsemirrorNode } from "remirror";
import { parseContent } from "utils/helper";
import { useParams } from "react-router";
import { LongPressDetectEvents, useLongPress } from "use-long-press";
import { setCommentMenu } from "features/mobileMenu/slice";

interface IProps {
  comment: IComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
  threadId: string;
  threadName: string;
  threadData?: Thread;
}

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

const NOTIFICATION_API = notificationUrl;

interface EditorRef {
  setContent: (content: any) => void;
}

const Comment: React.FC<IProps> = ({
  comment,
  listRef,
  memberList,
  threadId,
  threadName,
  threadData,
}) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const params = useParams();

  const dispatch = useAppDispatch();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);
  const mobileMenu = useAppSelector((state) => state.mobileMenu);

  const currentWorkspace = useMemo(
    () => workspace.workspaces.find((item) => item._id === params.workspaceId),
    [params.workspaceId, workspace.workspaces]
  );

  const channelData = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const [isReplyEditorVisible, setIsShowReplyEditorVisible] = useState(false);
  const editorRef = useRef<EditorRef | null>(null);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [subEditorState, setSubEditorState] = useState<string>("");
  const [isShowMoreSubComment, setIsShowMoreSubComment] =
    useState<boolean>(false);
  const [notifiedOptions, setNotifiedOptions] = useState<INotifiedOption[]>();
  const [selectedNotifiedOptions, setSelectedNotifiedOptions] = useState<
    INotifiedOption[]
  >([]);

  const [reactions, setReactions] = useState<IReaction[]>([]);
  const [openReaction, setOpenReaction] = useState<boolean>(false);

  const { manager, state, onChange } = useRemirror({
    extensions: () => extensions(false),
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(comment.content),
    selection: "end",
  });

  useEffect(() => {
    if (!comment.content) return;
    editorRef.current!.setContent(parseContent(comment.content));
  }, [comment.content]);

  useEffect(() => {
    if (memberList.length <= 0 || !auth || !comment) return;

    const options: INotifiedOption[] = memberList.map((item) => ({
      value: item._id,
      label: item._id === auth.user._id ? "Your Self" : item.firstName,
      flag: 3,
    }));

    setNotifiedOptions(options);
  }, [memberList, auth, comment]);

  useEffect(() => {
    if (notifiedOptions?.length <= 0 || !comment) return;

    const selectedOption = notifiedOptions?.find((item) => {
      return comment.createdBy?._id === item.value;
    });

    setSelectedNotifiedOptions([selectedOption]);
  }, [notifiedOptions, isReplyEditorVisible, comment]);

  const handleDeleteComment = () => {
    dispatch(deleteComment({ commentId: comment._id }));
    showToast({ message: `Successfully Delete Comment` });
  };

  const handleUpdateComment = () => {
    dispatch(
      updateComment({
        commentId: comment._id,
        content: JSON.stringify(state),
      })
    );

    discardComment();
    showToast({ message: `Successfully Update Comment` });
  };

  const discardComment = () => {
    editorRef.current!.setContent(parseContent(comment.content));

    setIsEdit(false);
  };

  const discardSubComment = () => {
    draft("reply").deleteByKey(comment._id);

    setIsShowReplyEditorVisible(false);
    setSubEditorState("");
  };

  const handleCreateSubComment = async (subCommentData: any) => {
    try {
      const invitedUsers: string[] = selectedNotifiedOptions
        .map((item) => item.value)
        .filter((item) => item !== auth.user._id);

      const { data, error } = await kontenbase.service("SubComments").create({
        content: JSON.stringify(subCommentData),
        parent: comment._id,
      });

      if (invitedUsers.length > 0) {
        const commentHooksUrl: string =
          process.env.REACT_APP_FUNCTION_HOOKS_COMMENT_URL;
        const basicAuth: { username: string; password: string } = {
          username: process.env.REACT_APP_FUNCTION_HOOKS_USERNAME,
          password: process.env.REACT_APP_FUNCTION_HOOKS_PASSWORD,
        };

        axios.post(
          commentHooksUrl,
          { taggedUsers: invitedUsers, threadId },
          {
            auth: basicAuth,
          }
        );

        axios.post(NOTIFICATION_API, {
          title: `${currentWorkspace.name} - #${channelData?.name}`,
          description: `${
            auth?.user.firstName
          } reply comment on ${threadName} - ${editorToHTML(state)}`,
          externalUserIds: invitedUsers,
          url: `${frontendUrl}/a/${params.workspaceId}/ch/${params.channelId}/t/${params.threadId}`,
        });
      }

      if (!error) {
        dispatch(
          addSubCommentToComment({
            subComment: data,
            threadId,
            commentId: comment._id,
          })
        );

        draft("reply").deleteByKey(comment._id);

        discardSubComment();
        setIsShowMoreSubComment(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addReactionToCommentHandler = async ({
    commentId,
    emoji,
    unified,
  }: {
    commentId: string;
    emoji: string;
    unified: string;
  }) => {
    if (reactions?.length >= 20)
      return showToast({ message: "Reached reactions limit" });

    try {
      const findSameReaction = reactions.find(
        (data) => data.unified === unified || data.emoji === emoji
      );

      if (!findSameReaction) {
        const { data: addReactionData, error: addReactionError } =
          await kontenbase.service("Reactions").create({
            emoji,
            unified,
            users: [auth.user._id],
            comment: [commentId],
          });
        if (addReactionError) throw new Error(addReactionError.message);

        const { error: linkCommentsError } = await kontenbase
          .service("Comments")
          .link(commentId, { reactions: addReactionData?._id });
        if (linkCommentsError) throw new Error(linkCommentsError.message);

        const { error: updateComment } = await kontenbase
          .service("Comments")
          .updateById(commentId, { content: comment.content });
        if (updateComment) throw new Error(updateComment.message);

        let newReaction: IReaction = {
          emoji: emoji,
          unified: unified,
          users: [auth.user],
        };

        return setReactions((prev) => [...prev, newReaction]);
      }

      showToast({ message: `This emoji is already used` });
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const removeReactionHandler = async ({
    reaction,
  }: {
    reaction: IReaction;
  }) => {
    try {
      if (reaction._id) {
        const { error: removeReactionError } = await kontenbase
          .service("Reactions")
          .deleteById(reaction._id);
        if (removeReactionError) throw new Error(removeReactionError.message);

        const { error: updateComment } = await kontenbase
          .service("Comments")
          .updateById(comment._id, { content: comment.content });
        if (updateComment) throw new Error(updateComment.message);
      }

      setReactions((prev) =>
        prev.filter((data) => data.unified !== reaction.unified)
      );
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const reactionUser = async ({
    reaction,
    type,
  }: {
    reaction: IReaction;
    type: "add" | "remove";
  }) => {
    try {
      if (reaction._id) {
        switch (type) {
          case "add":
            const { error: linkError } = await kontenbase
              .service("Reactions")
              .link(reaction._id, { users: auth.user._id });
            if (linkError) throw new Error(linkError.message);

            setReactions((prev) => {
              return prev.map((data) => {
                if (data._id === reaction._id) {
                  return { ...data, users: [...data.users, auth.user] };
                }
                return data;
              });
            });
            break;
          case "remove":
            const { error: unlinkError } = await kontenbase
              .service("Reactions")
              .unlink(reaction._id, { users: auth.user._id });
            if (unlinkError) throw new Error(unlinkError.message);

            setReactions((prev) => {
              return prev.map((data) => {
                if (data._id === reaction._id) {
                  return {
                    ...data,
                    users: data.users.filter(
                      (user) => user._id !== auth.user._id
                    ),
                  };
                }
                return data;
              });
            });
            break;

          default:
            break;
        }

        const { error: updateComment } = await kontenbase
          .service("Comments")
          .updateById(comment._id, { content: comment.content });
        if (updateComment) throw new Error(updateComment.message);
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const fetchReactions = async () => {
    try {
      if (comment?.reactions?.length > 0) {
        const { data: reactionsData, error: reactionsError } = await kontenbase
          .service("Reactions")
          .find({ where: { comment: comment._id }, lookup: ["users"] });
        if (reactionsError) throw new Error(reactionsError.message);

        setReactions(reactionsData);
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const reactionTooltip = ({ member }: { member: Member[] }) => {
    if (member.length === 1) {
      return member[0].firstName;
    }
    return `${member[member.length - 1].firstName} and ${member.length - 1} ${
      member.length - 1 > 1 ? "others" : "other"
    }`;
  };

  const commentBind = useLongPress(
    () => {
      if (!isEdit) {
        dispatch(
          setCommentMenu({ data: comment, type: "open", category: "comment" })
        );
        window.navigator.vibrate([20]);
      }
    },
    {
      detect: LongPressDetectEvents.TOUCH,
      cancelOnMovement: true,
    }
  );

  useEffect(() => {
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.reactions]);

  useEffect(() => {
    if (subEditorState) {
      draft("reply").set(comment._id, {
        content: subEditorState,
        createdById: auth.user._id,
        threadId,
      });
    }
  }, [subEditorState, auth.user._id, comment._id, threadId]);

  useEffect(() => {
    const getReplyDraft = draft("reply").get(comment._id);
    if (getReplyDraft.content && getReplyDraft.createdById === auth.user._id) {
      setSubEditorState(getReplyDraft.content);
    }
  }, [auth.user._id, comment._id]);

  useEffect(() => {
    if (
      mobileMenu?.comment?.data?._id === comment?._id &&
      !["close", "open"].includes(mobileMenu?.comment?.type)
    ) {
      if (mobileMenu?.comment?.type === "edit") {
        setIsEdit(mobileMenu?.comment?.type === "edit");
      }
      if (mobileMenu?.comment?.type === "reaction") {
        setOpenReaction(mobileMenu?.comment?.type === "reaction");
      }
      if (mobileMenu?.comment?.type === "delete") {
        handleDeleteComment();
      }
      if (mobileMenu?.comment?.type === "reply") {
        setIsShowReplyEditorVisible(mobileMenu?.comment?.type === "reply");
      }
      dispatch(setCommentMenu({ data: null, type: "close" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileMenu?.comment, comment?._id]);

  return (
    <div key={comment._id}>
      {comment?.isClosedComment && (
        <div className="flex items-start mb-2">
          <div className="w-8 flex flex-col items-center">
            <BiMessageAltCheck size={18} className="text-indigo-500" />
            <div className="w-[2px] bg-neutral-300 h-4 my-1"></div>
          </div>
          <div className="ml-4 w-full">
            <p className="text-xs text-neutral-500">
              <span className="font-semibold">
                {comment.createdBy?.firstName}
              </span>{" "}
              closed this thread.
            </p>
          </div>
        </div>
      )}
      {comment?.isOpenedComment && (
        <div className="flex items-start mb-2">
          <div className="w-8 flex flex-col items-center">
            <BiMessageAltDots size={18} className="text-green-500" />
            <div className="w-[2px] bg-neutral-300 h-4 my-1"></div>
          </div>
          <div className="ml-4 w-full">
            <p className="text-xs text-neutral-500">
              <span className="font-semibold">
                {comment.createdBy?.firstName}
              </span>{" "}
              reopened this thread.
            </p>
          </div>
        </div>
      )}
      <div className="group flex items-start relative text-sm" ref={listRef}>
        <div className="w-8">
          {comment.createdBy?.avatar?.[0]?.url ? (
            <Avatar src={comment.createdBy?.avatar?.[0]?.url} />
          ) : (
            <NameInitial name={getNameInitial(comment.createdBy?.firstName)} />
          )}
        </div>
        <div className="ml-4 w-full">
          <div className="-mt-1.5 flex items-center justify-start">
            <p className=" font-semibold mb-0 mt-0 mr-2">
              {comment.createdBy?.firstName}
            </p>{" "}
            <p className="mb-0 mt-0 text-xs">
              <ReactMoment
                fromNow
                locale="en"
                format="LT"
                titleFormat="DD MMMM YYYY, LT"
                withTitle
              >
                {comment?.updatedAt || comment?.createdAt}
              </ReactMoment>
            </p>
          </div>
          <div className=" w-[70vw] sm:w-full ">
            <div className={`min-h-[2.5rem]`} {...commentBind}>
              {comment?.isClosedComment && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  Added a conclusion:
                </p>
              )}
              <Preview
                isEdit={isEdit}
                discardComment={discardComment}
                handleUpdateComment={handleUpdateComment}
                remmirorProps={{ manager, onChange, state }}
                editorRef={editorRef}
              />
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {reactions?.map(
                  (reaction, idx, arr) =>
                    reaction.users.length > 0 && (
                      <div
                        key={idx + reaction.unified}
                        className="flex items-center gap-2"
                      >
                        <Reaction
                          data={reaction}
                          active={
                            reaction.users.findIndex(
                              (data) => data._id === auth.user._id
                            ) >= 0
                          }
                          onClick={() => {
                            if (threadData?.isClosed) return;
                            if (
                              reaction.users.length === 1 &&
                              reaction.users[0]._id === auth.user._id
                            ) {
                              removeReactionHandler({
                                reaction,
                              });
                            } else {
                              const findUser: boolean =
                                reaction.users.findIndex(
                                  (data) => data._id === auth.user._id
                                ) >= 0;
                              if (!findUser) {
                                reactionUser({ reaction, type: "add" });
                              } else {
                                reactionUser({ reaction, type: "remove" });
                              }
                            }
                          }}
                          tooltip={reactionTooltip({ member: reaction.users })}
                          disabled={threadData?.isClosed}
                        />
                        {idx === arr.length - 1 && !threadData?.isClosed && (
                          <Popover className="relative">
                            {({ open: popOpen, close }) => (
                              <>
                                <Popover.Button as="div">
                                  <IconButton
                                    size="medium"
                                    className={`flex items-center`}
                                    onClick={() => {
                                      if (isMobile) {
                                        setOpenReaction(true);
                                      }
                                    }}
                                  >
                                    <VscReactions
                                      size={18}
                                      className="text-neutral-400 hover:cursor-pointer hover:text-neutral-500"
                                    />
                                  </IconButton>
                                </Popover.Button>
                                {!isMobile && (
                                  <Popover.Panel className="absolute z-40 right-full top-1/2 transform -translate-y-1/2 mr-2">
                                    <Picker
                                      onEmojiClick={(_, emojiObject) => {
                                        addReactionToCommentHandler({
                                          commentId: comment._id,
                                          emoji: emojiObject.emoji,
                                          unified: emojiObject.unified,
                                        });

                                        close();
                                      }}
                                      skinTone={SKIN_TONE_NEUTRAL}
                                      disableSkinTonePicker
                                      native
                                    />
                                  </Popover.Panel>
                                )}
                              </>
                            )}
                          </Popover>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>

            <div>
              {comment.subComments?.length > 0 && (
                <>
                  <div className="border-t-[1px] border-gray-200 mb-8" />
                  {!isShowMoreSubComment && (
                    <div className="text-sm -mt-4">
                      {comment.subComments?.length > 2 && (
                        <p
                          className="mb-4  hover:border-b-[1px] border-gray-400 w-fit hover:cursor-pointer"
                          onClick={() => setIsShowMoreSubComment(true)}
                        >
                          Show {comment.subComments?.length - 2} More Comments
                        </p>
                      )}
                      {comment.subComments?.length >= 2 && (
                        <SubComment
                          comment={{
                            ...comment.subComments?.[
                              comment.subComments.length - 2
                            ],
                            createdBy: memberList.find(
                              (item) =>
                                //@ts-ignore
                                item._id ===
                                comment.subComments?.[
                                  comment.subComments.length - 2
                                ].createdBy
                            ),
                          }}
                          key={
                            comment.subComments?.[
                              comment.subComments.length - 2
                            ]?._id
                          }
                          parentId={comment._id}
                          threadId={threadId}
                          listMentions={notifiedOptions
                            ?.filter(
                              (item) =>
                                item.flag === 3 && item.label !== "Your Self"
                            )
                            ?.map((item) => ({
                              id: item.value,
                              label: item.label,
                            }))}
                        />
                      )}
                      <SubComment
                        comment={{
                          ...comment.subComments?.[
                            comment.subComments.length - 1
                          ],
                          createdBy: memberList.find(
                            (item) =>
                              //@ts-ignore
                              item._id ===
                              comment.subComments?.[
                                comment.subComments.length - 1
                              ].createdBy
                          ),
                        }}
                        key={
                          comment.subComments?.[comment.subComments.length - 1]
                            ?._id
                        }
                        parentId={comment._id}
                        threadId={threadId}
                        listMentions={notifiedOptions
                          ?.filter(
                            (item) =>
                              item.flag === 3 && item.label !== "Your Self"
                          )
                          ?.map((item) => ({
                            id: item.value,
                            label: item.label,
                          }))}
                      />
                    </div>
                  )}
                  {isShowMoreSubComment &&
                    comment.subComments?.map((subComment) => {
                      const newSubComment = {
                        ...subComment,
                        createdBy: memberList.find(
                          //@ts-ignore
                          (item) => item._id === subComment.createdBy
                        ),
                      };

                      return (
                        <SubComment
                          comment={newSubComment}
                          key={subComment._id}
                          parentId={comment._id}
                          threadId={threadId}
                          listMentions={notifiedOptions
                            ?.filter(
                              (item) =>
                                item.flag === 3 && item.label !== "Your Self"
                            )
                            ?.map((item) => ({
                              id: item.value,
                              label: item.label,
                            }))}
                        />
                      );
                    })}
                </>
              )}
            </div>

            {isReplyEditorVisible && (
              <SubCommentForm
                comment={comment}
                discardSubComment={discardSubComment}
                handleCreateSubComment={handleCreateSubComment}
                notifiedOptions={notifiedOptions}
                selectedNotifiedOptions={selectedNotifiedOptions}
                setSelectedNotifiedOptions={setSelectedNotifiedOptions}
              />
            )}
          </div>

          <div
            className={`hidden md:block absolute -top-3 right-0 z-10 bg-white rounded px-1 shadow ${
              threadData?.isClosed ||
              !channelData?.members?.includes(auth.user._id)
                ? "md:hidden"
                : ""
            }`}
          >
            <Menu as="div" className="relative flex">
              {({ open }) => (
                <>
                  <Popover className="relative">
                    {({ open: popOpen, close }) => (
                      <>
                        <Popover.Button as="div">
                          <IconButton
                            size="medium"
                            className={`${
                              open || popOpen ? "flex" : "hidden"
                            } group-hover:flex items-center`}
                            onClick={() => {
                              if (isMobile) {
                                setOpenReaction(true);
                              }
                            }}
                          >
                            <VscReactions
                              size={24}
                              className="text-neutral-400 hover:cursor-pointer hover:text-neutral-500"
                            />
                          </IconButton>
                        </Popover.Button>
                        {!isMobile && (
                          <Popover.Panel className="absolute z-10 right-full top-0 mr-2">
                            <Picker
                              onEmojiClick={(_, emojiObject) => {
                                addReactionToCommentHandler({
                                  commentId: comment._id,
                                  emoji: emojiObject.emoji,
                                  unified: emojiObject.unified,
                                });

                                close();
                              }}
                              skinTone={SKIN_TONE_NEUTRAL}
                              disableSkinTonePicker
                              native
                            />
                          </Popover.Panel>
                        )}
                      </>
                    )}
                  </Popover>
                  {!isReplyEditorVisible && !isEdit && (
                    <IconButton
                      size="medium"
                      className={`${
                        open ? "flex" : "hidden"
                      } group-hover:flex items-center`}
                    >
                      <HiOutlineReply
                        size={20}
                        className="text-neutral-400 hover:cursor-pointer hover:text-neutral-500"
                        onClick={() => setIsShowReplyEditorVisible(true)}
                      />
                    </IconButton>
                  )}

                  {auth.user._id === comment.createdBy?._id && !isEdit && (
                    <Menu.Button as="div">
                      <IconButton
                        size="medium"
                        className={`${
                          open ? "flex" : "hidden"
                        } group-hover:flex items-center`}
                      >
                        <BiDotsHorizontalRounded
                          size={25}
                          className="text-neutral-400 hover:cursor-pointer hover:text-neutral-500"
                        />
                      </IconButton>
                    </Menu.Button>
                  )}
                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      <MenuItem
                        icon={
                          <BiEditAlt size={20} className="text-neutral-400" />
                        }
                        onClick={() => {
                          setIsEdit(true);
                        }}
                        title="Edit Comment"
                      />
                      <MenuItem
                        icon={
                          <BiTrash size={20} className="text-neutral-400" />
                        }
                        onClick={handleDeleteComment}
                        title="Delete Comment"
                      />
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          </div>
        </div>
      </div>
      <Dialog
        open={openReaction}
        onClose={() => setOpenReaction(false)}
        className="fixed z-50 inset-0 "
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded w-screen mt-auto h-[55vh] p-3">
            <Dialog.Title className="font-semibold text-lg">
              Add reactions
            </Dialog.Title>
            <div>
              <Picker
                onEmojiClick={(_, emojiObject) => {
                  addReactionToCommentHandler({
                    commentId: comment._id,
                    emoji: emojiObject.emoji,
                    unified: emojiObject.unified,
                  });
                  setOpenReaction(false);
                }}
                skinTone={SKIN_TONE_NEUTRAL}
                disableSkinTonePicker
                disableSearchBar
                native
                pickerStyle={{
                  width: "100%",
                  boxShadow: "none",
                  border: "none",
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Comment;
