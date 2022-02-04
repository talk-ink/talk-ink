import React, { useRef, useState } from "react";

import Button from "components/Button/Button";
import Remirror from "components/Remirror";

interface IProps {
  content?: string;
  isEdit?: boolean;
  setEditorState?: React.Dispatch<React.SetStateAction<string>>;
  discardComment?: () => void;
  handleUpdateComment?: () => void;
  remmirorProps?: any;
  editorRef?: any;
}

const Preview: React.FC<IProps> = ({
  content,
  isEdit,
  setEditorState,
  discardComment,
  handleUpdateComment,
  remmirorProps,
  editorRef,
}) => {
  const { manager, onChange, state } = remmirorProps || {};
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  return !isEdit ? (
    <Remirror
      remmirorProps={{ manager, onChange, state }}
      fromComment
      readOnly
      editorRef={editorRef}
    />
  ) : (
    <div className="px-2 border-solid border-2 border-light-blue-500 rounded-md mb-4 mt-2  ">
      <Remirror
        remmirorProps={{ manager, onChange, state }}
        fromComment
        editorRef={editorRef}
      />

      <div className="flex justify-between ">
        <div />
        <div className="flex items-center py-2">
          <Button
            type="submit"
            className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
            onClick={discardComment}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
            onClick={handleUpdateComment}
            disabled={imageLoading}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
