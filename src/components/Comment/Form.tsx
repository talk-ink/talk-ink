import React, { useState, useMemo, useEffect } from "react";

import axios from "axios";
import Avatar from "components/Avatar/Avatar";
import Button from "components/Button/Button";
import Editor from "rich-markdown-editor";
import { kontenbase } from "lib/client";
import Select from "react-select";

import { createComment } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Channel, Member } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { useParams } from "react-router";
import { notificationUrl } from "utils/helper";

interface IProps {
  isShowEditor: boolean;
  setIsShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
  threadId: string;
  threadName: string;
  scrollToBottom: () => void;
  interactedUsers: string[];
  memberList: Member[];
}

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

const NOTIFICATION_API = notificationUrl;

const Form: React.FC<IProps> = ({
  isShowEditor,
  setIsShowEditor,
  threadId,
  threadName,
  scrollToBottom,
  interactedUsers,
  memberList,
}) => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [editorState, setEditorState] = useState<string>("");
  const [notifiedOptions, setNotifiedOptions] = useState<INotifiedOption[]>();
  const [selectedNotifiedOptions, setSelectedNotifiedOptions] = useState<
    INotifiedOption[]
  >([]);
  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);

  useEffect(() => {
    const options: INotifiedOption[] = [
      {
        value: "INTERACTEDUSERS",
        label: `Everyone who interacted (${interactedUsers.length || 1})`,
        flag: 1,
      },
      {
        value: "ALLUSERSINCHANNEL",
        label: `Everyone in Channel (${memberList.length || 1})`,
        flag: 2,
      },
      ...memberList
        .map((item) => ({
          value: item._id,
          label: item.firstName,
          flag: 3,
        }))
        .filter((item) => item.value !== auth.user._id),
    ];

    setNotifiedOptions(options);
    setSelectedNotifiedOptions([options[0]]);
  }, [interactedUsers, memberList, auth]);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const discardComment = () => {
    setIsShowEditor(false);
    setEditorState("");
  };

  const handleCreateComment = () => {
    let _invitedUsers: string[] = [];

    const isInteractedUsersSelected = !!selectedNotifiedOptions.find(
      (item) => item.value === "INTERACTEDUSERS"
    );

    const isAllChannelSelected = !!selectedNotifiedOptions.find(
      (item) => item.value === "ALLUSERSINCHANNEL"
    );

    const isMemberSelected = !!selectedNotifiedOptions.find(
      (item) => item.flag === 3
    );

    if (isInteractedUsersSelected) {
      _invitedUsers = interactedUsers.filter((item) => item !== auth.user._id);
    }

    if (isAllChannelSelected) {
      _invitedUsers = channelData.members.filter(
        (item) => item !== auth.user._id
      );
    }

    if (isMemberSelected) {
      _invitedUsers = selectedNotifiedOptions.map((item) => item.value);
    }

    dispatch(
      createComment({
        content: editorState,
        threadId,
        tagedUsers: _invitedUsers,
      })
    );

    if (_invitedUsers.length > 0) {
      axios.post(NOTIFICATION_API, {
        title: `${auth?.user.firstName} comment on ${threadName}`,
        description: editorState.replace(/(<([^>]+)>)/gi, ""),
        externalUserIds: _invitedUsers,
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
        <div className="flex items-center py-3 ">
          <div>
            <Avatar src={auth.user.avatar || auth.user.avatar?.[0]?.url} />
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
              value={selectedNotifiedOptions}
              onChange={(e: any) => {
                const isInteractedUsersSelected =
                  !!selectedNotifiedOptions.find(
                    (item) => item.value === "INTERACTEDUSERS"
                  );
                const isCurrInteractedUsersSelected = !!e.find(
                  (item: any) => item.value === "INTERACTEDUSERS"
                );

                const isAllChannelSelected = !!selectedNotifiedOptions.find(
                  (item) => item.value === "ALLUSERSINCHANNEL"
                );
                const isCurrAllChannelSelected = !!e.find(
                  (item: any) => item.value === "ALLUSERSINCHANNEL"
                );

                const isMemberSelected = !!selectedNotifiedOptions.find(
                  (item) => item.flag === 3
                );
                const isCurrMemberSelected = !!e.find(
                  (item: any) => item.flag === 3
                );

                const currSelectedOptions = e.filter((item: any) => {
                  if (isAllChannelSelected) {
                    if (isCurrMemberSelected) {
                      return item.flag === 3;
                    } else {
                      return item.flag === 1;
                    }
                  }

                  if (isInteractedUsersSelected) {
                    if (isCurrMemberSelected) {
                      return item.flag === 3;
                    } else {
                      return item.flag === 2;
                    }
                  }

                  if (isMemberSelected && isCurrInteractedUsersSelected) {
                    return item.flag === 1;
                  }

                  if (isMemberSelected && isCurrAllChannelSelected) {
                    return item.flag === 2;
                  }

                  return item;
                });

                setSelectedNotifiedOptions(currSelectedOptions);
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
            <div />
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
