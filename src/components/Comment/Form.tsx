import React, { useState, useMemo } from "react";

import axios from "axios";
import Avatar from "components/Avatar/Avatar";
import Button from "components/Button/Button";
import Editor from "rich-markdown-editor";
import { kontenbase } from "lib/client";
import Select from "react-select";
import makeAnimated from "react-select/animated";

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
const animatedComponents = makeAnimated();

const colourOptions = [
  {
    value: "all-1",
    label: "Everyone who interacted",
    color: "#00B8D9",
    isFixed: true,
  },
  {
    value: "all-2",
    label: "Everyone in Channel",
    color: "#0052CC",
    isFixed: true,
  },
  { value: "purple", label: "Purple", color: "#5243AA" },
  { value: "red", label: "Red", color: "#FF5630", isFixed: true },
  { value: "orange", label: "Orange", color: "#FF8B00" },
  { value: "yellow", label: "Yellow", color: "#FFC400" },
  { value: "green", label: "Green", color: "#36B37E" },
  { value: "forest", label: "Forest", color: "#00875A" },
  { value: "slate", label: "Slate", color: "#253858" },
  { value: "silver", label: "Silver", color: "#666666" },
];

const Form: React.FC<IProps> = ({
  isShowEditor,
  setIsShowEditor,
  threadId,
  threadName,
  scrollToBottom,
}) => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [editorState, setEditorState] = useState<string>("");
  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const discardComment = () => {
    setIsShowEditor(false);
    setEditorState("");
  };

  const handleCreateComment = () => {
    dispatch(
      createComment({
        content: editorState,
        threadId,
      })
    );

    const filteredMemberWithoutOwner = channelData.members.filter(
      (item) => item !== auth.user.id
    );

    if (filteredMemberWithoutOwner.length > 0) {
      axios.post(NOTIFICATION_API, {
        title: `${auth?.user.firstName} comment on ${threadName}`,
        description: editorState.replace(/(<([^>]+)>)/gi, ""),
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
            className="ml-4  appearance-none border-[1px] border-light-blue-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hover:cursor-pointer"
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
        <div className="px-2 border-solid border-[1px] border-light-blue-500 rounded-xl mb-5	">
          <div className="mt-1 flex w-fit items-center">
            <div className="mr-2">
              <div className="bg-gray-200 w-fit px-2 py-[2.9px]  rounded-sm  text-sm">
                Tag:
              </div>
            </div>
            <Select
              isClearable={false}
              className="text-sm custom-select "
              closeMenuOnSelect={false}
              components={animatedComponents}
              defaultValue={[colourOptions[0]]}
              isMulti
              options={colourOptions}
            />
          </div>
          <Editor
            key="editor"
            defaultValue={editorState}
            onChange={(getContent: () => string) =>
              setEditorState(getContent())
            }
            autoFocus
            uploadImage={async (file: File) => {
              const { data } = await kontenbase.storage.upload(file);
              return data.url;
            }}
            className="markdown-overrides comment-editor"
          />

          <div className="flex justify-between">
            icon
            <div className="flex items-center py-2">
              <Button
                type="submit"
                className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
                onClick={discardComment}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
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
