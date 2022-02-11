import React, { useEffect, useMemo, useRef, useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Menu } from "@headlessui/react";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import MenuItem from "components/Menu/MenuItem2";
import IconButton from "components/Button/IconButton";
import { kontenbase } from "lib/client";

import { IComment, ISubComment } from "types";

import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";
import {
  updateSubCommentToComment,
  deleteSubCommentToComment,
} from "features/threads";

import { useRemirror } from "@remirror/react";
import { extensions } from "components/Remirror/extensions";
import { htmlToProsemirrorNode } from "remirror";
import { parseContent } from "utils/helper";
import { LongPressDetectEvents, useLongPress } from "use-long-press";
import { setCommentMenu } from "features/mobileMenu/slice";
import { useParams } from "react-router-dom";

interface Mention {
  id: string;
  label: string;
}

interface IProps {
  comment: IComment | ISubComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
  parentId: string;
  threadId: string;
  listMentions: Mention[];
}

interface EditorRef {
  setContent: (content: any) => void;
}

const Comment: React.FC<IProps> = ({
  comment,
  listRef,
  parentId,
  threadId,
  listMentions,
}) => {
  const params = useParams();

  const [showOption, setShowOption] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const mobileMenu = useAppSelector((state) => state.mobileMenu);

  const channelData = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const editorRef = useRef<EditorRef | null>(null);

  const [isEdit, setIsEdit] = useState(false);

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

  const handleDeleteComment = async () => {
    try {
      const { error } = await kontenbase
        .service("SubComments")
        .deleteById(comment._id);

      if (!error) {
        dispatch(
          deleteSubCommentToComment({
            subCommentId: comment._id,
            threadId,
            commentId: parentId,
          })
        );

        showToast({ message: `Successfully Delete Comment` });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateComment = async () => {
    try {
      const { data, error } = await kontenbase
        .service("SubComments")
        .updateById(comment._id, {
          content: JSON.stringify(state),
        });

      if (!error) {
        dispatch(
          updateSubCommentToComment({
            subComment: data,
            threadId,
            commentId: parentId,
          })
        );
        discardComment();
        showToast({ message: `Successfully Update Comment` });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const discardComment = () => {
    editorRef.current!.setContent(parseContent(comment.content));
    setIsEdit(false);
  };

  const replyBind = useLongPress(
    () => {
      if (comment?.createdBy?._id === auth.user._id && !isEdit) {
        dispatch(
          setCommentMenu({
            data: comment,
            type: "open",
            category: "subComment",
          })
        );
      }
    },
    { detect: LongPressDetectEvents.TOUCH, cancelOnMovement: true }
  );

  useEffect(() => {
    if (
      mobileMenu?.comment?.data?._id === comment?._id &&
      !["close", "open"].includes(mobileMenu?.comment?.type)
    ) {
      if (mobileMenu?.comment?.type === "edit") {
        setIsEdit(mobileMenu?.comment?.type === "edit");
      }
      if (mobileMenu?.comment?.type === "delete") {
        handleDeleteComment();
      }
      dispatch(setCommentMenu({ data: null, type: "close" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileMenu?.comment, comment?._id]);

  return (
    <div
      className="flex items-start relative "
      ref={listRef}
      {...replyBind}
      onMouseEnter={() => setShowOption(true)}
      onMouseLeave={() => setShowOption(false)}
    >
      <div className=" w-8 mr-2 ">
        {comment.createdBy?.avatar?.[0]?.url ? (
          <Avatar src={comment.createdBy?.avatar?.[0]?.url} size="small" />
        ) : (
          <NameInitial
            name={getNameInitial(comment.createdBy?.firstName)}
            size="small"
          />
        )}
      </div>
      <div className="w-full">
        <div className="-mt-1.5 flex items-center justify-start">
          <p className="text-xs font-semibold mb-0 mt-0 mr-2">
            {comment.createdBy?.firstName}
          </p>{" "}
          <p className="mb-0 mt-0 text-xs">
            <ReactMoment
              fromNow
              locale="en"
              format="HH:mm"
              titleFormat="DD MMMM YYYY, HH:mm"
              withTitle
            >
              {comment?.updatedAt || comment?.createdAt}
            </ReactMoment>
          </p>
        </div>
        <div className=" w-[70vw] sm:w-full min-h-[3rem] text-xs pt-1">
          <Preview
            isEdit={isEdit}
            discardComment={discardComment}
            handleUpdateComment={handleUpdateComment}
            remmirorProps={{ manager, onChange, state }}
            editorRef={editorRef}
            listMentions={listMentions}
          />
        </div>
        {auth.user._id === comment.createdBy?._id &&
          !isEdit &&
          channelData?.members?.includes(auth.user._id) && (
            <Menu as="div" className="hidden md:block absolute -top-3 right-0">
              {({ open }) => (
                <>
                  <Menu.Button as="div">
                    <IconButton
                      size="medium"
                      className={`${open || showOption ? "flex" : "hidden"}`}
                    >
                      <BiDotsHorizontalRounded
                        size={25}
                        className={`text-neutral-400 hover:cursor-pointer hover:text-neutral-500`}
                      />
                    </IconButton>
                  </Menu.Button>
                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      <Menu>
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
                      </Menu>
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          )}
      </div>
    </div>
  );
};

export default Comment;
