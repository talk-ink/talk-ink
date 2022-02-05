import React, { useState, useMemo, useEffect, useRef } from "react";

import axios from "axios";
import Select from "react-select";

import Avatar from "components/Avatar/Avatar";
import Button from "components/Button/Button";
import NameInitial from "components/Avatar/NameInitial";
import CommentBadge from "./CommentBadge";
import Remirror from "components/Remirror";

import { createComment } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { Channel, Member } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { useParams } from "react-router";
import {
  createUniqueArray,
  draft,
  editorToHTML,
  getNameInitial,
  notificationUrl,
} from "utils/helper";
import { kontenbase } from "lib/client";

import { updateChannel } from "features/channels/slice";
import { useToast } from "hooks/useToast";
import { useRemirror } from "@remirror/react";
import { htmlToProsemirrorNode } from "remirror";
import { extensions } from "components/Remirror/extensions";
import { frontendUrl } from "utils/helper";
import IconButton from "components/Button/IconButton";
import { MdSend } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

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
  invited?: boolean;
}

interface EditorRef {
  setContent: (content: any) => void;
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
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const [showToast] = useToast();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [notifiedOptions, setNotifiedOptions] = useState<INotifiedOption[]>();
  const [selectedNotifiedOptions, setSelectedNotifiedOptions] = useState<
    INotifiedOption[]
  >([]);
  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const workspace = useAppSelector((state) => state.workspace);

  const currentWorkspace = useMemo(
    () => workspace.workspaces.find((item) => item._id === params.workspaceId),
    [params.workspaceId, workspace.workspaces]
  );

  const editorRef = useRef<EditorRef | null>(null);

  const { manager, onChange, state } = useRemirror({
    extensions: () => extensions(false, "Reply"),
    stringHandler: htmlToProsemirrorNode,
    content: "",
    selection: "start",
  });

  const [invitedUser, setInvitedUser] = useState<
    INotifiedOption | null | undefined
  >(null);

  useEffect(() => {
    const everyoneInChannelCount = memberList.filter((data) =>
      data.channels.includes(params.channelId)
    );
    const options: INotifiedOption[] = [
      {
        value: "INTERACTEDUSERS",
        label: `Everyone who interacted (${interactedUsers.length || 1})`,
        flag: 1,
      },
      {
        value: "ALLUSERSINCHANNEL",
        label: `Everyone in Channel (${everyoneInChannelCount.length || 1})`,
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
  }, [interactedUsers, memberList, auth, params.channelId]);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const discardComment = () => {
    draft("comment").deleteByKey(params.threadId);
    editorRef.current!.setContent({
      type: "doc",
      content: [],
    });

    setIsShowEditor(false);
  };

  const handleCreateComment = async () => {
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
        content: JSON.stringify(state),
        threadId,
        tagedUsers: _invitedUsers,
      })
    );

    try {
      const findInvitedToChannel = selectedNotifiedOptions
        .filter((data) => data?.invited)
        .map((data) => data.value);
      const members = createUniqueArray([
        ...channelData.members,
        ...findInvitedToChannel,
      ]);

      if (findInvitedToChannel.length > 0) {
        const { error: updateChannelError } = await kontenbase
          .service("Channels")
          .updateById(params.channelId, { members });
        if (updateChannelError) throw new Error(updateChannelError.message);

        dispatch(
          updateChannel({
            _id: params.channelId,
            members,
          })
        );
      }
    } catch (error: any) {
      console.log("err", error?.message);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }

    if (_invitedUsers.length > 0) {
      axios.post(NOTIFICATION_API, {
        title: `${currentWorkspace.name} - #${channelData?.name}`,
        description: `${auth?.user.firstName} comment on ${threadName}`,
        externalUserIds: _invitedUsers,
        url: `${frontendUrl}/a/${params.workspaceId}/ch/${params.channelId}/t/${params.threadId}`,
      });
    }

    draft("comment").deleteByKey(params.threadId);

    discardComment();

    scrollToBottom();
  };

  useEffect(() => {
    if (editorToHTML(state, "").length > 0) {
      draft("comment").set(params.threadId, {
        content: JSON.stringify(state),
        createdById: auth.user._id,
        threadId: params.threadId,
      });
    }
  }, [state, auth.user._id, params.threadId]);

  useEffect(() => {
    if (!isShowEditor) return;
    const getCommentDraft = draft("comment").get(params.threadId);
    if (
      getCommentDraft.content &&
      getCommentDraft.createdById === auth.user._id
    ) {
      try {
        const parsedText = JSON.parse(getCommentDraft.content);
        console.log("jalan", parsedText);

        editorRef.current!.setContent(parsedText.doc);
      } catch (error) {
        console.log(error);
      }
    }
  }, [isShowEditor, auth.user._id, params.threadId]);

  return (
    <div className=" bg-white sticky bottom-0 max-w-4xl w-full">
      {!isShowEditor && (
        <div className="flex items-center py-3 ">
          {auth.user.avatar ? (
            <Avatar src={auth.user.avatar} />
          ) : (
            <NameInitial
              name={getNameInitial(auth.user.firstName)}
              className="mr-4"
            />
          )}

          <input
            className=" ml-4 appearance-none border-[1px] border-light-blue-500 rounded-[25px] w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hover:cursor-pointer"
            type="text"
            placeholder="Input Your Message"
            readOnly
            onClick={() => {
              setIsShowEditor(true);
              scrollToBottom();
            }}
          />
        </div>
      )}

      <div
        className={`px-2 border-solid border-[1px] border-light-blue-500 rounded-xl mb-5 ${
          isShowEditor ? "block" : "hidden"
        }`}
      >
        <div className="mt-1 flex w-full items-center">
          <div className="mr-2">
            <div
              className={`md:bg-gray-200 w-fit md:px-2 py-[2.9px]  rounded-sm text-sm`}
            >
              Tag:
            </div>
          </div>
          <Select
            value={selectedNotifiedOptions}
            onChange={(e: any) => {
              const ids: string[] = e?.map(
                (data: INotifiedOption) => data?.value
              );
              const dataIndex = selectedNotifiedOptions.findIndex(
                (data) => !ids.includes(data.value)
              );

              const isInteractedUsersSelected = !!selectedNotifiedOptions.find(
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

              if (
                e.length > 0 &&
                dataIndex < 0 &&
                !channelData.members.includes(e?.[e?.length - 1]?.value) &&
                !["INTERACTEDUSERS", "ALLUSERSINCHANNEL"].includes(
                  e?.[e?.length - 1]?.value
                )
              ) {
                return setInvitedUser(e?.[e?.length - 1]);
              }

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
            className="text-sm custom-select"
            closeMenuOnSelect={false}
            defaultValue={[notifiedOptions?.[0]]}
            isMulti
            options={notifiedOptions}
            placeholder="Select Tags"
            //@ts-ignore
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            styles={{
              multiValue: (base) => ({
                ...base,
                backgroundColor: isMobile ? "white" : "#e9ecef",
              }),
              container: (base) => ({
                ...base,
                width: "100%",
                background: isMobile && "white",
              }),
              menuList: (base) => ({
                ...base,
                maxWidth: 300,
              }),
            }}
          />
        </div>

        <Remirror
          remmirorProps={{ manager, onChange, state }}
          fromComment
          editorRef={editorRef}
          listMentions={notifiedOptions
            ?.filter((item) => item.flag === 3)
            ?.map((item) => ({
              id: item.value,
              label: item.label,
            }))}
        />

        <div className="flex justify-between">
          <div />
          <div className="flex items-center py-2">
            {!isMobile && (
              <Button
                type="submit"
                className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
                onClick={discardComment}
              >
                Cancel
              </Button>
            )}

            {!isMobile && (
              <Button
                type="submit"
                className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
                onClick={handleCreateComment}
              >
                Post
              </Button>
            )}

            {isMobile && (
              <IconButton size="medium">
                <MdSend
                  size={20}
                  className="text-indigo-500"
                  onClick={handleCreateComment}
                />
              </IconButton>
            )}
          </div>
        </div>
      </div>

      {!!invitedUser && (
        <CommentBadge
          name={invitedUser?.label}
          onInvited={() => {
            setSelectedNotifiedOptions((prev) => [
              ...prev.filter(
                (data) =>
                  !["INTERACTEDUSERS", "ALLUSERSINCHANNEL"].includes(data.value)
              ),
              { ...invitedUser, invited: true },
            ]);
            setInvitedUser(null);
          }}
          onCancel={() => setInvitedUser(null)}
        />
      )}
    </div>
  );
};

export default Form;
