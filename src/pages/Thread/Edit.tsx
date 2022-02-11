import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import TextEditor from "components/TextEditor/TextEditor";
import { useFormik } from "formik";
import { Thread, Channel } from "types";
import { createThreadValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { useAppDispatch } from "hooks/useAppDispatch";
import { updateThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";
import { useRemirror } from "@remirror/react";

import { extensions } from "components/Remirror/extensions";
import { htmlToProsemirrorNode } from "remirror";
import { parseContent } from "utils/helper";

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

  const { manager, onChange, state } = useRemirror({
    extensions,
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(threadData.content),
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

  const onSubmit = async (values: Thread) => {
    setApiLoading(true);

    try {
      const { data, error } = await kontenbase
        .service("Threads")
        .updateById(params.threadId, {
          name: values.name,
          content: values.content,
        });

      if (error) throw new Error(error.message);

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
          `/a/${params.workspaceId}/ch/${params.channelId}/t/${data?._id}`,
          { replace: true }
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
        {threadData?.content && (
          <TextEditor
            formik={formik}
            loading={loading}
            remmirorProps={{ manager, onChange, state }}
            isEdit
          />
        )}
      </div>
    </MainContentContainer>
  );
}

export default EditThread;
