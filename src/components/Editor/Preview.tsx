import React from "react";

import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import Button from "components/Button/Button";

import EditedEditor from "./Editor";

interface IProps {
  content: string;
  isEdit: boolean;
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  discardComment: () => void;
  handleUpdateComment: () => void;
}

const Preview: React.FC<IProps> = ({
  content,
  isEdit,
  editorState,
  setEditorState,
  discardComment,
  handleUpdateComment,
}) => {
  return typeof content === "string" && !isEdit ? (
    <Editor
      readOnly={true}
      editorState={EditorState.createWithContent(
        convertFromRaw(JSON.parse(content))
      )}
      toolbarHidden
    />
  ) : (
    <div className="px-2 border-solid border-2 border-light-blue-500 rounded-md ">
      <EditedEditor editorState={editorState} setEditorState={setEditorState} />
      <div className="flex justify-between">
        icon
        <div className="flex items-center py-2">
          <Button
            type="submit"
            className="mr-3 text-sm flex items-center justify-center bg-cyan-100 min-w-[5rem] text-black"
            onClick={discardComment}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
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
