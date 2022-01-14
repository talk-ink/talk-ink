import React, { useState, useMemo } from "react";

import { convertToRaw, EditorState } from "draft-js";
import axios from "axios";
import draftToHtml from "draftjs-to-html";

import Avatar from "components/Avatar/Avatar";
import Button from "components/Button/Button";
import CommentEditor from "components/Editor/Editor";

import { createComment } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Channel } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { useParams } from "react-router";

interface IProps {
  isShowEditor: boolean;
  setIsShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
  threadId: string;
  threadName: string;
  scrollToBottom: () => void;
}

const NOTIFICATION_API = process.env.REACT_APP_NOTIFICATION_API;

const Form: React.FC<IProps> = ({
  isShowEditor,
  setIsShowEditor,
  threadId,
  threadName,
  scrollToBottom,
}) => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const discardComment = () => {
    setIsShowEditor(false);
    setEditorState(EditorState.createEmpty());
  };

  const handleCreateComment = () => {
    dispatch(
      createComment({
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        threadId,
      })
    );

    const filteredMemberWithoutOwner = channelData.members.filter(
      (item) => item !== auth.user.id
    );

    if (filteredMemberWithoutOwner.length > 0) {
      axios.post(NOTIFICATION_API, {
        title: `${auth?.user.firstName} comment on ${threadName}`,
        description: draftToHtml(
          convertToRaw(editorState.getCurrentContent())
        ).replace(/(<([^>]+)>)/gi, ""),
        externalUserIds: filteredMemberWithoutOwner,
      });
    }

    discardComment();
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  return (
    <div className="sticky bottom-0 left-0 z-30  bg-white">
      {!isShowEditor && (
        <div className="flex items-center py-5 ">
          <div>
            <Avatar src={auth.user.avatar} />
          </div>
          <input
            className="ml-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hover:cursor-pointer"
            type="text"
            placeholder="Input Your Message"
            readOnly
            onClick={() => {
              setIsShowEditor(true);
            }}
          />
        </div>
      )}

      {isShowEditor && (
        <div className="px-2 border-solid border-2 border-light-blue-500 rounded-md mb-5	">
          <CommentEditor
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <div className="flex justify-between">
            icon
            <div className="flex items-center py-2">
              <Button
                type="submit"
                className="mr-3 text-sm flex items-center justify-center bg-cyan-100 min-w-[5rem] text-black"
                onClick={discardComment}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
                onClick={handleCreateComment}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
