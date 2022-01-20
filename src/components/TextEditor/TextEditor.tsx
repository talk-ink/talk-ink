import React, { useState, useEffect } from "react";

import { FormikProps } from "formik";
import Button from "components/Button/Button";
import { Thread } from "types";
import { useNavigate, useParams } from "react-router";
import Editor from "rich-markdown-editor";

import { kontenbase } from "lib/client";

type Props = React.PropsWithChildren<{
  formik: FormikProps<Thread>;
  loading: boolean;
  deleteDraft: () => void;
}>;

type PropsDelay = React.PropsWithChildren<{
  waitBeforeShow?: number;
}>;

const Delayed = ({ children, waitBeforeShow = 100 }: PropsDelay) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
  }, [waitBeforeShow]);

  return isShown ? <>{children}</> : null;
};

function TextEditor({ formik, loading, deleteDraft }: Props) {
  const [preview, setPreview] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const isDisabled = !formik.values.name || !formik.values.content || loading;

  return (
    <div className="flex flex-col h-full ">
      <div></div>
      <div className="flex flex-col h-full min-h-0">
        <input
          className="w-full h-auto outline-none text-3xl font-bold mb-4"
          placeholder="Thread title"
          onChange={formik.handleChange("name")}
          onBlur={formik.handleBlur("name")}
          value={formik.values.name}
        />

        {!preview && (
          <Delayed>
            <Editor
              autoFocus
              key="editor"
              onChange={(getContent) =>
                formik.setFieldValue("content", getContent())
              }
              onBlur={() => formik.handleBlur("content")}
              defaultValue={formik.values.content}
              uploadImage={async (file: File) => {
                const { data } = await kontenbase.storage.upload(file);
                return data.url;
              }}
              className="markdown-overrides fix-editor"
            />
          </Delayed>
        )}

        {preview && (
          <Editor
            key="preview"
            value={formik.values.content}
            readOnly
            className="markdown-overrides"
          />
        )}
      </div>
      <div className="absolute left-0 bottom-0 w-full flex justify-between items-center px-5 pb-5">
        <div></div>
        <div className="flex gap-2">
          {/* <Button
            className={` hover:bg-neutral-200 rounded text-xs font-medium px-5 ${
              !preview ? "text-indigo-500" : "text-white bg-indigo-500"
            }`}
            onClick={() => {
              setPreview((prev) => !prev);
            }}
          >
            Preview
          </Button> */}

          <Button
            className=" hover:bg-neutral-200 rounded text-xs font-medium px-5"
            onClick={() => {
              deleteDraft();
              navigate(`/a/${params?.workspaceId}/ch/${params?.channelId}`);
            }}
          >
            Discard
          </Button>
          <Button
            type="submit"
            className=" bg-indigo-500 hover:bg-indigo-500 rounded text-xs font-medium px-5 text-white"
            disabled={isDisabled}
            onClick={formik.handleSubmit}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
