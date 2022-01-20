import React, { useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Menu } from "@headlessui/react";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import Popup from "components/Popup/Popup";
import MenuItem from "components/Menu/MenuItem2";
import IconButton from "components/Button/IconButton";

import { IComment } from "types";
import {
  deleteComment,
  updateComment,
} from "features/threads/slice/asyncThunk";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";

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
        {comment.createdBy?.avatar?.[0]?.url ? (
          <Avatar src={comment.createdBy?.avatar?.[0]?.url} />
        ) : (
          <NameInitial
            name={getNameInitial(comment.createdBy?.firstName)}
            className="mr-4"
          />
        )}
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
        {auth.user._id === comment.createdBy?._id && !isEdit && (
          <div className="absolute top-0 right-0 z-50">
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button as={React.Fragment}>
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
                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      <MenuItem
                        icon={
                          <BiEditAlt size={20} className="text-neutral-400" />
                        }
                        onClick={() => {
                          setIsEdit(true);
                          setEditorState(comment.content);
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
        )}
      </div>
    </div>
  );
};

export default Comment;
