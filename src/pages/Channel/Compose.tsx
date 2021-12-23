import React, { useState } from "react";

import { HiChevronLeft } from "react-icons/hi";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import Button from "components/Button/Button";
import { createBrowserHistory } from "history";
import TextEditor from "components/TextEditor/TextEditor";
import { useFormik } from "formik";
import { Thread } from "types";
import { createThreadValidation } from "utils/validators";
import { kontenbase } from "lib/client";
import { useLocation, useNavigate, useParams } from "react-router";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";

const initialValues: Thread = {
  name: "",
  content: "",
};

function Compose() {
  const params = useParams();
  const navigate = useNavigate();

  const [apiLoading, setApiLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: createThreadValidation,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const deleteDraft = () => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    delete parsedThreadDraft[params?.composeId];

    localStorage.setItem("threadsDraft", JSON.stringify(parsedThreadDraft));
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

      navigate(
        `/a${params.workspaceId}/ch/${params.channelId}/t/${createThread?.data?._id}`
      );
    } catch (error) {
      console.log("err", error);
    } finally {
      setApiLoading(false);
    }
  };

  const loading = apiLoading;

  return (
    <MainContentContainer
      className="pt-10 h-full"
      header={<MainContentHeader channel="General" title="New Thread" />}
    >
      <div className="w-full h-5/6 px-14">
        <div className="w-full h-full border border-neutral-300 rounded-lg p-5">
          <TextEditor
            formik={formik}
            loading={loading}
            deleteDraft={deleteDraft}
          />
        </div>
      </div>
    </MainContentContainer>
  );
}

export default Compose;
