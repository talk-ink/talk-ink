import React, { useEffect, useRef, useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
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

interface IProps {
  comment: IComment | ISubComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
  parentId: string;
  threadId: string;
}

interface EditorRef {
  setContent: (content: any) => void;
}

const Comment: React.FC<IProps> = ({
  comment,
  listRef,
  parentId,
  threadId,
}) => {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const auth = useAppSelector((state) => state.auth);
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

  return (
    <div className="group flex items-start relative mb-6" ref={listRef}>
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
            <ReactMoment format="DD/MM/YYYY LT">
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
          />
        </div>
        {auth.user._id === comment.createdBy?._id && !isEdit && (
          <div className="absolute -top-3 right-0  hidden group-hover:block  ">
            <Popup
              content={
                <Menu>
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setIsEdit(true);
                    }}
                    title="Edit Comment"
                  />
                  <MenuItem
                    icon={<BiTrash size={20} className="text-neutral-400" />}
                    onClick={handleDeleteComment}
                    title="Delete Comment"
                  />
                </Menu>
              }
              position="bottom"
            >
              <IconButton size="medium">
                <BiDotsHorizontalRounded
                  size={25}
                  className="text-neutral-400 hover:cursor-pointer hover:text-neutral-500"
                />
              </IconButton>
            </Popup>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
