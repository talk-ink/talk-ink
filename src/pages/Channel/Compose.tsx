import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";

import TextEditor from "components/TextEditor/TextEditor";
import { useFormik } from "formik";
import { Channel, Thread } from "types";
import { createThreadValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { useAppDispatch } from "hooks/useAppDispatch";
import { addThread } from "features/threads";
import { useToast } from "hooks/useToast";
import { useAppSelector } from "hooks/useAppSelector";

const initialValues: Thread = {
  name: "",
  content: "",
};

moment.locale("id");

function Compose() {
  const params = useParams();
  const navigate = useNavigate();
  const [showToast] = useToast();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [apiLoading, setApiLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: createThreadValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const checkDraftAvailable = () => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    const selectedDraft = parsedThreadDraft[+params.composeId];

    if (selectedDraft) {
      formik.setFieldValue("name", selectedDraft.name);
      formik.setFieldValue("content", selectedDraft.content);
    }
  };

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  useEffect(() => {
    checkDraftAvailable();
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
        lastChange: moment.tz("Asia/Jakarta").toISOString(),
      },
    };
    localStorage.setItem("threadsDraft", JSON.stringify(newDraft));
  };

  const onSubmit = async (values: Thread) => {
    setApiLoading(true);

    try {
      const createThread = await kontenbase.service("Threads").create({
        name: values.name,
        content: values.content,
        channel: params.channelId,
      });

      deleteDraft();

      if (createThread.data) {
        dispatch(
          addThread({
            ...createThread.data,
            createdBy: auth.user,
          })
        );
        navigate(
          `/a/${params.workspaceId}/ch/${params.channelId}/t/${createThread?.data?._id}`
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
      <div className="w-[50vw] h-[80vh] border border-neutral-300 rounded-lg p-7 mx-auto ">
        <TextEditor
          formik={formik}
          loading={loading}
          deleteDraft={deleteDraft}
        />
      </div>
    </MainContentContainer>
  );
}

export default Compose;
