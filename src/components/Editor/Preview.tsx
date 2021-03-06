import React from "react";

import Button from "components/Button/Button";
import Remirror from "components/Remirror";

interface Mention {
  id: string;
  label: string;
}

interface IProps {
  content?: string;
  isEdit?: boolean;
  setEditorState?: React.Dispatch<React.SetStateAction<string>>;
  discardComment?: () => void;
  handleUpdateComment?: () => void;
  remmirorProps?: any;
  editorRef?: any;
  listMentions?: Mention[];
}

const Preview: React.FC<IProps> = ({
  isEdit,
  discardComment,
  handleUpdateComment,
  remmirorProps,
  editorRef,
  listMentions,
}) => {
  const { manager, onChange, state } = remmirorProps || {};

  return !isEdit ? (
    <Remirror
      remmirorProps={{ manager, onChange, state }}
      fromComment
      readOnly
      editorRef={editorRef}
      listMentions={listMentions}
    />
  ) : (
    <div className="px-2 border-solid border-2 border-light-blue-500 rounded-md mb-4 mt-2  ">
      <Remirror
        remmirorProps={{ manager, onChange, state }}
        fromComment
        editorRef={editorRef}
        listMentions={listMentions}
      />

      <div className="flex justify-between -mt-9">
        <div />
        <div className="flex items-center py-2">
          <Button
            type="submit"
            className="mr-3 text-sm flex items-center justify-center bg-neutral-100 min-w-[5rem] text-slate-700"
            onClick={discardComment}
          >
            Discard
          </Button>
          <Button
            type="submit"
            className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
            onClick={handleUpdateComment}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
