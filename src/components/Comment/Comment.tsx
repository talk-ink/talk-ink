import React, { useEffect, useState } from "react";

import { BiDotsHorizontalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import ReactMoment from "react-moment";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Menu } from "@headlessui/react";
import Editor from "rich-markdown-editor";
import { HiOutlineReply } from "react-icons/hi";
import Select from "react-select";

import Avatar from "components/Avatar/Avatar";
import Preview from "components/Editor/Preview";
import MenuItem from "components/Menu/MenuItem2";
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
import axios from "axios";
import { notificationUrl } from "utils/helper";

interface IProps {
  comment: IComment;
  listRef?: React.LegacyRef<HTMLDivElement>;
  memberList: Member[];
  threadId: string;
  threadName: string;
}

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

const NOTIFICATION_API = notificationUrl;

const Comment: React.FC<IProps> = ({
  comment,
  listRef,
  memberList,
  threadId,
  threadName,
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
  const [notifiedOptions, setNotifiedOptions] = useState<INotifiedOption[]>();
  const [selectedNotifiedOptions, setSelectedNotifiedOptions] = useState<
    INotifiedOption[]
  >([]);

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
      const invitedUsers: string[] = selectedNotifiedOptions.map(
        (item) => item.value
      );

      const { data, error } = await kontenbase.service("SubComments").create({
        content: subEditorState,
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
          title: `${auth?.user.firstName} reply comment on ${threadName}`,
          description: editorState.replace(/(<([^>]+)>)/gi, ""),
          externalUserIds: invitedUsers,
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

        discardSubComment();
        setIsShowMoreSubComment(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="group flex items-start mb-4 relative text-sm" ref={listRef}>
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
            <ReactMoment format="DD/MM/YYYY LT">
              {comment?.updatedAt || comment?.createdAt}
            </ReactMoment>
          </p>
        </div>
        <div className=" w-[70vw] sm:w-full ">
          <div className={`min-h-[2.5rem]`}>
            <Preview
              content={comment.content}
              isEdit={isEdit}
              setEditorState={setEditorState}
              discardComment={discardComment}
              handleUpdateComment={handleUpdateComment}
            />
          </div>

          <div>
            {comment.subComments?.length > 0 && (
              <>
                <div className="border-t-[1px] border-gray-200 mb-8" />
                {!isShowMoreSubComment && (
                  <div className="text-sm -mt-3">
                    {comment.subComments?.length > 1 && (
                      <p
                        className="mb-3  hover:border-b-[1px] border-gray-400 w-fit hover:cursor-pointer"
                        onClick={() => setIsShowMoreSubComment(true)}
                      >
                        Show More {comment.subComments?.length - 1} Comments
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
            <div
              className="flex flex-col justify-between px-2 border-solid border-[1px] border-light-blue-500 rounded-md min-h-[12rem] mb-2"
              onBlur={(e) => {
                if (!e.relatedTarget && isReplyEditorVisible) {
                  setIsShowReplyEditorVisible(false);
                }
              }}
            >
              <div>
                <div className="mt-1 flex w-full items-center">
                  <div className="mr-2">
                    <div className="bg-gray-200 w-fit px-2 py-[2.9px]  rounded-sm  text-sm">
                      Tag:
                    </div>
                  </div>
                  <Select
                    value={selectedNotifiedOptions}
                    onChange={(e: any) => {
                      setSelectedNotifiedOptions(e);
                    }}
                    isClearable={false}
                    className="text-sm custom-select "
                    closeMenuOnSelect={false}
                    defaultValue={[notifiedOptions[0]]}
                    isMulti
                    options={notifiedOptions}
                    placeholder="Select Tags"
                    //@ts-ignore
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      container: (base) => ({
                        ...base,
                        width: "100%",
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxWidth: 300,
                      }),
                    }}
                  />
                </div>
                <Editor
                  key="edited"
                  defaultValue={subEditorState}
                  className="markdown-overrides sub-comment-editor"
                  onChange={(getContent: () => string) =>
                    setSubEditorState(getContent())
                  }
                  placeholder={`Reply to ${comment.createdBy?.firstName}`}
                  autoFocus
                />
              </div>
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
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute -top-3 right-0 z-50">
          <Menu as="div" className="relative flex">
            {({ open }) => (
              <>
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
                )}
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
                      icon={<BiTrash size={20} className="text-neutral-400" />}
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
  );
};

export default Comment;
