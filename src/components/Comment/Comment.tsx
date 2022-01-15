import React, { useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import IconButton from "components/Button/IconButton";

import { IComment } from "types";
import {
  deleteComment,
  updateComment,
} from "features/threads/slice/asyncThunk";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";

interface IProps {
  comment: IComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
}

const Comment: React.FC<IProps> = ({ comment, listRef }) => {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const auth = useAppSelector((state) => state.auth);

  const [isEdit, setIsEdit] = useState(false);
  const [editorState, setEditorState] = useState<string>("");

  const handleDeleteComment = () => {
    dispatch(deleteComment({ commentId: comment._id }));
    showToast({ message: `Successfully Delete Comment` });
  };

  const handleUpdateComment = () => {
    dispatch(
      updateComment({
        commentId: comment._id,
        content: editorState,
      })
    );

    discardComment();
    showToast({ message: `Successfully Update Comment` });
  };

  const discardComment = () => {
    setIsEdit(false);
    setEditorState("");
  };

  return (
    <div className="group flex items-start mb-8 relative " ref={listRef}>
      <div className=" w-8">
        <Avatar src="https://picsum.photos/100" />
      </div>
      <div className="ml-4 w-full">
        <div className="-mt-1.5 flex items-center justify-start">
          <p className=" font-semibold mb-0 mt-0 mr-2">
            {comment.createdBy?.firstName}
          </p>{" "}
          <p className="mb-0 mt-0 text-xs">
            <ReactMoment format="DD/MM/YYYY LT">
              {comment?.updatedAt || comment?.createdAt}
            </ReactMoment>
          </p>
        </div>
        <div className=" w-[70vw] sm:w-full">
          <Preview
            content={comment.content}
            isEdit={isEdit}
            setEditorState={setEditorState}
            discardComment={discardComment}
            handleUpdateComment={handleUpdateComment}
          />
        </div>
        {auth.user.id === comment.createdBy?._id && !isEdit && (
          <div className="absolute top-0 right-0 z-50 hidden group-hover:block  ">
            <Popup
              content={
                <Menu>
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setIsEdit(true);
                      setEditorState(comment.content);
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
