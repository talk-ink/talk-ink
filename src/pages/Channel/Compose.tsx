import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";
import axios from "axios";
import Select from "react-select";
// import makeAnimated from "react-select/animated";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import TextEditor from "components/TextEditor/TextEditor";
import { extensions } from "components/Remirror/extensions";

import { useFormik } from "formik";
import { Channel, Thread, Member } from "types";
import { createThreadValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { useAppDispatch } from "hooks/useAppDispatch";
import { addThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import { fetchChannels } from "features/channels/slice";
import { notificationUrl } from "utils/helper";
import { htmlToProsemirrorNode } from "remirror";
import { useRemirror } from "@remirror/react";

const initialValues: Thread = {
  name: "",
  content: "",
};

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

// const animatedComponents = makeAnimated();

moment.locale("id");

const NOTIFICATION_API = notificationUrl;

function Compose() {
  const params = useParams();
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();
  const [notifiedOptions, setNotifiedOptions] = useState<INotifiedOption[]>([]);
  const [selectedNotifiedOptions, setSelectedNotifiedOptions] = useState<
    INotifiedOption[]
  >([]);
  const [memberList, setMemberList] = useState<Member[]>([]);

  const [apiLoading, setApiLoading] = useState(false);

  const getCurrentDraft = () => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    const selectedDraft = parsedThreadDraft[+params.composeId];

    if (selectedDraft) {
      return selectedDraft?.content?.doc;
    }

    return "";
  };

  const { manager, onChange, state } = useRemirror({
    extensions: () => extensions(false, "Write Something Nice..."),
    stringHandler: htmlToProsemirrorNode,
    content: getCurrentDraft(),
    selection: "end",
  });

  const formik = useFormik({
    initialValues,
    validationSchema: createThreadValidation,
    onSubmit: (values) => {
      onSubmit({ ...values, content: JSON.stringify(state) });
    },
    enableReinitialize: true,
  });

  const checkDraftAvailable = () => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    const selectedDraft = parsedThreadDraft[+params.composeId];

    if (selectedDraft) {
      formik.setFieldValue("name", selectedDraft?.name);
    }
  };

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  useEffect(() => {
    if (!params.composeId) return;
    checkDraftAvailable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.composeId]);

  const deleteDraft = () => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    delete parsedThreadDraft[params?.composeId];

    localStorage.setItem("threadsDraft", JSON.stringify(parsedThreadDraft));
  };

  const saveDraft = () => {
    const parsedThreadsDraft = JSON.parse(localStorage.getItem("threadsDraft"));

    const newDraft = {
      ...parsedThreadsDraft,
      [+params.composeId]: {
        ...parsedThreadsDraft[+params.composeId],
        ...formik.values,
        content: state,
        lastChange: moment.tz("Asia/Jakarta").toISOString(),
      },
    };
    localStorage.setItem("threadsDraft", JSON.stringify(newDraft));
  };

  const onSubmit = async (values: Thread) => {
    setApiLoading(true);

    let _invitedUsers: string[] = [];

    const isAllChannelSelected = !!selectedNotifiedOptions.find(
      (item) => item.value === "ALLUSERSINCHANNEL"
    );

    const isMemberSelected = !!selectedNotifiedOptions.find(
      (item) => item.flag === 3
    );

    if (isAllChannelSelected) {
      _invitedUsers = channelData.members.filter(
        (item) => item !== auth.user._id
      );
    }

    if (isMemberSelected) {
      _invitedUsers = selectedNotifiedOptions.map((item) => item.value);
    }

    try {
      const createThread = await kontenbase.service("Threads").create({
        name: values.name,
        content: values.content,
        channel: params.channelId,
        workspace: params.workspaceId,
        tagedUsers: _invitedUsers,
      });

      if (createThread.error) throw new Error(createThread.error.message);

      if (_invitedUsers.length > 0) {
        axios.post(NOTIFICATION_API, {
          title: `New Thread - ${channelData?.name}`,
          description: values.name,
          externalUserIds: _invitedUsers,
        });
      }

      deleteDraft();

      if (createThread.data) {
        dispatch(
          addThread({
            ...createThread.data,
            createdBy: {
              ...auth.user,
              avatar: [
                {
                  url: auth.user.avatar,
                },
              ],
            },
          })
        );
        navigate(
          `/a/${params.workspaceId}/ch/${params.channelId}/t/${createThread?.data?._id}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    } finally {
      setApiLoading(false);
    }
  };

  const getMemberHandler = async () => {
    try {
      const memberList = await kontenbase.service("Users").find({
        where: { workspaces: params.workspaceId, channels: params.channelId },
        lookup: ["avatar"],
      });

      if (memberList.error) throw new Error(memberList.error.message);

      if (memberList.data) {
        setMemberList(memberList.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  useEffect(() => {
    getMemberHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const options: INotifiedOption[] = [
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
  }, [memberList, auth]);

  useEffect(() => {
    dispatch(
      fetchChannels({ userId: auth.user._id, workspaceId: params.workspaceId })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, auth.user._id]);

  const loading = apiLoading;

  return (
    <MainContentContainer
      className="pt-10 h-full"
      header={
        <MainContentHeader
          channel={channelData?.name}
          title="New Thread"
          onBackClick={() => {
            saveDraft();
          }}
        />
      }
    >
      <div className="w-full sm:w-[50vw] min-h-[80vh] border-[1px] border-light-blue-500 rounded-lg p-3 mx-auto relative -mt-12 sm:mt-0">
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 w-fit px-2 py-[2.9px]  rounded-sm  text-sm mr-2">
            Post In:
          </div>
          <p
            className="text-sm text-blue-500 cursor-pointer"
            onClick={() =>
              navigate(`/a/${params.workspaceId}/ch/${params.channelId}`)
            }
          >
            #{channelData?.name}
          </p>
        </div>
        <div className="mb-2 flex w-fit items-center">
          <div className="mr-2">
            <div className="bg-gray-200 w-fit px-2 py-[2.9px]  rounded-sm  text-sm">
              Tag:
            </div>
          </div>

          <Select
            value={selectedNotifiedOptions}
            onChange={(e: any) => {
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
            // components={animatedComponents}
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
        <TextEditor
          formik={formik}
          loading={loading}
          deleteDraft={deleteDraft}
          remmirorProps={{ manager, onChange, state }}
        />
      </div>
    </MainContentContainer>
  );
}

export default Compose;
