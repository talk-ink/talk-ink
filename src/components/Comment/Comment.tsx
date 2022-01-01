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
}

const Comment: React.FC<IProps> = ({ comment }) => {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const auth = useAppSelector((state) => state.auth);

  const [isEdit, setIsEdit] = useState(false);
  const [editorState, setEditorState] = useState<any>();

  const handleDeleteComment = () => {
    dispatch(deleteComment({ commentId: comment._id }));
    showToast({ message: `Successfully Delete Comment` });
  };

  const handleUpdateComment = () => {
    dispatch(
      updateComment({
        commentId: comment._id,
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      })
    );

    discardComment();
    showToast({ message: `Successfully Update Comment` });
  };

  const discardComment = () => {
    setIsEdit(false);
    setEditorState(EditorState.createEmpty());
  };

  return (
    <div className="group  flex items-start mb-8 relative ">
      <Avatar src="https://picsum.photos/100" />
      <div className="prose  flex-grow-0 ml-4">
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

        <Preview
          content={comment.content}
          isEdit={isEdit}
          editorState={editorState}
          setEditorState={setEditorState}
          discardComment={discardComment}
          handleUpdateComment={handleUpdateComment}
        />
        {auth.user.id === comment.createdBy?._id && (
          <div className="absolute top-0 right-0 z-50 hidden group-hover:block  ">
            <Popup
              content={
                <Menu>
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setIsEdit(true);
                      setEditorState(
                        EditorState.createWithContent(
                          convertFromRaw(JSON.parse(comment.content))
                        )
                      );
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
