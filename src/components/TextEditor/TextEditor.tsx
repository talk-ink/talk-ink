import React, { KeyboardEvent, useRef } from "react";

import { FormikProps } from "formik";
import Button from "components/Button/Button";
import { Thread } from "types";
import { useNavigate, useParams } from "react-router";
import Remirror from "components/Remirror";

interface Mention {
  id: string;
  label: string;
}

type Props = React.PropsWithChildren<{
  formik: FormikProps<Thread>;
  loading: boolean;
  deleteDraft?: () => void;
  isEdit?: boolean;
  remmirorProps?: any;
  listMentions?: Mention[];
}>;

function TextEditor({
  formik,
  loading,
  deleteDraft,
  isEdit,
  remmirorProps,
  listMentions = [],
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const params = useParams();
  const textEditorRef = useRef(null);

  const isDisabled = !formik.values.name || !remmirorProps.state || loading;

  const handleEnter = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key.toLowerCase() === "enter") {
      textEditorRef.current?.focusAtStart();
      event.preventDefault();
    }
  };

  return (
    <div className="flex flex-col h-full mb-10">
      <div></div>
      <div className="flex flex-col h-full min-h-0">
        <input
          className="w-full h-auto outline-none text-3xl font-bold mb-4"
          placeholder="Thread title"
          onChange={formik.handleChange("name")}
          onBlur={formik.handleBlur("name")}
          value={formik.values.name}
          autoFocus
          onKeyDown={handleEnter}
        />

        <Remirror remmirorProps={remmirorProps} listMentions={listMentions} />
      </div>
      <div className="absolute left-0 bottom-0 w-full flex justify-between items-center px-5 pb-5">
        <div></div>
        <div className="flex gap-2">
          {!isEdit && (
            <Button
              className=" hover:bg-neutral-200 rounded text-xs font-medium px-5"
              onClick={() => {
                deleteDraft();
                navigate(`/a/${params?.workspaceId}/ch/${params?.channelId}`);
              }}
            >
              Discard
            </Button>
          )}
          <Button
            type="submit"
            className=" bg-indigo-500 hover:bg-indigo-500 rounded text-xs font-medium px-5 text-white"
            disabled={isDisabled}
            onClick={formik.handleSubmit}
          >
            {isEdit ? "Save" : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
