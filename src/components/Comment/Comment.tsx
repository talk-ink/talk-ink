import React, { useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import Editor from "rich-markdown-editor";
import { BsFillChatRightDotsFill } from "react-icons/bs";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import IconButton from "components/Button/IconButton";
import SubComment from "./SubComment";
import Button from "components/Button/Button";

import { IComment, Member } from "types";
import {
  deleteComment,
  updateComment,
} from "features/threads/slice/asyncThunk";
import { addSubCommentToComment } from "features/threads/slice";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";
import { kontenbase } from "lib/client";

interface IProps {
  comment: IComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
  threadId: string;
}

const Comment: React.FC<IProps> = ({
  comment,
  listRef,
  memberList,
  threadId,
}) => {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const auth = useAppSelector((state) => state.auth);
  const [isReplyEditorVisible, setIsShowReplyEditorVisible] = useState(false);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editorState, setEditorState] = useState<string>("");
  const [subEditorState, setSubEditorState] = useState<string>("");
  const [isShowMoreSubComment, setIsShowMoreSubComment] =
    useState<boolean>(false);

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

  const discardSubComment = () => {
    setIsShowReplyEditorVisible(false);
    setSubEditorState("");
  };

  const handleCreateSubComment = async () => {
    try {
      const { data, error } = await kontenbase.service("SubComments").create({
        content: subEditorState,
        parent: comment._id,
      });

      if (!error) {
        dispatch(
          addSubCommentToComment({
            subComment: data,
            threadId,
            commentId: comment._id,
          })
        );

        discardSubComment();
        setIsShowMoreSubComment(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="group flex items-start mb-4 relative " ref={listRef}>
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
        <div className=" w-[70vw] sm:w-full ">
          <div
            className={`relative ${
              isReplyEditorVisible ? "mb-0" : "mb-10"
            } min-h-[2.5rem]`}
          >
            <Preview
              content={comment.content}
              isEdit={isEdit}
              setEditorState={setEditorState}
              discardComment={discardComment}
              handleUpdateComment={handleUpdateComment}
            />
            {!isReplyEditorVisible && (
              <div
                className="text-sm absolute -bottom-7 left-0 z-20 flex items-center hover:cursor-pointer hover:opacity-80 text-gray-500"
                onClick={() => setIsShowReplyEditorVisible(true)}
              >
                <BsFillChatRightDotsFill className="mr-1" />
                Reply
              </div>
            )}
          </div>

          <div>
            {comment.subComments?.length > 0 && (
              <>
                <div className="border-t-[1px] border-gray-200 mb-6" />
                {!isShowMoreSubComment && (
                  <div className="text-sm -mt-3">
                    {comment.subComments?.length > 1 && (
                      <p
                        className="mb-3  hover:border-b-[1px] border-gray-400 w-fit hover:cursor-pointer"
                        onClick={() => setIsShowMoreSubComment(true)}
                      >
                        View More {comment.subComments?.length - 1} Comment
                      </p>
                    )}
                    <SubComment
                      comment={{
                        ...comment.subComments?.[0],
                        createdBy: memberList.find(
                          (item) =>
                            //@ts-ignore
                            item._id === comment.subComments?.[0].createdBy
                        ),
                      }}
                      key={comment.subComments?.[0]?._id}
                      parentId={comment._id}
                      threadId={threadId}
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
                      />
                    );
                  })}
              </>
            )}
          </div>

          {isReplyEditorVisible && (
            <div className="flex flex-col justify-between px-2 border-solid border-[1px] border-light-blue-500 rounded-md min-h-[8rem] mb-2">
              <Editor
                key="edited"
                defaultValue={subEditorState}
                className="markdown-overrides"
                onChange={(getContent: () => string) =>
                  setSubEditorState(getContent())
                }
                placeholder={`Reply to ${comment.createdBy?.firstName}`}
                autoFocus
              />
              <div className="flex justify-end ">
                <div className="flex items-center py-2">
                  <Button
                    type="submit"
                    className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
                    onClick={discardSubComment}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
                    onClick={handleCreateSubComment}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {auth.user._id === comment.createdBy?._id && !isEdit && (
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
