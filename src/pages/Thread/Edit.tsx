import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";
import Select from "react-select";
// import makeAnimated from "react-select/animated";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import TextEditor from "components/TextEditor/TextEditor";
import { useFormik } from "formik";
import { Thread, Member, Channel } from "types";
import { createThreadValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { useAppDispatch } from "hooks/useAppDispatch";
import { updateThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import { fetchChannels } from "features/channels/slice";

interface INotifiedOption {
  value: string;
  label: string;
  color?: string;
  isFixed?: boolean;
  flag: number;
}

// const animatedComponents = makeAnimated();

moment.locale("id");

function EditThread() {
  const params = useParams();
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);

  const dispatch = useAppDispatch();

  const [apiLoading, setApiLoading] = useState(false);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === params.threadId);
  }, [thread.threads, params.threadId]);

  const initialValues: Thread = {
    name: threadData.name,
    content: threadData.content,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: createThreadValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const onSubmit = async (values: Thread) => {
    setApiLoading(true);

    try {
      const { data } = await kontenbase
        .service("Threads")
        .updateById(params.threadId, {
          name: values.name,
          content: values.content,
        });

      if (data) {
        dispatch(
          updateThread({
            ...data,
            createdBy: {
              ...auth.user,
              avatar: [
                {
                  url: auth.user.avatar,
                },
              ],
            },
            comments: threadData.comments,
          })
        );
        navigate(
          `/a/${params.workspaceId}/ch/${params.channelId}/t/${data?._id}`
        );
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setApiLoading(false);
    }
  };

  const loading = apiLoading;

  useEffect(() => {
    if (!auth.user || !threadData.createdBy) return;
    if (threadData.createdBy._id !== auth.user._id) {
      navigate("/404");
    }
  }, [navigate, auth, threadData]);

  return (
    <MainContentContainer
      className="pt-10 h-full"
      header={
        <MainContentHeader
          channel={channelData?.name}
          title={`Edit ${threadData.name}`}
          onBackClick={() => {
            navigate(-1);
          }}
        />
      }
    >
      <div className="w-[50vw] min-h-[80vh] border-[1px] border-light-blue-500 rounded-lg p-3 mx-auto relative ">
        <TextEditor formik={formik} loading={loading} isEdit={true} />
      </div>
    </MainContentContainer>
  );
}

export default EditThread;
