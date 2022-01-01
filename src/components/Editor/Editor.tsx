import React from "react";

import { EditorState } from "draft-js";
import { toolbar } from "utils/editor-toolbar";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface IProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

const CustomEditor: React.FC<IProps> = ({ editorState, setEditorState }) => {
  const onEditorStateChange = (editorState: EditorState) => {
    setEditorState(editorState);
  };

  return (
    <Editor
      editorState={editorState}
      toolbarClassName="toolbarClassName"
      wrapperClassName="editor-wrapper"
      editorClassName="editor"
      onEditorStateChange={onEditorStateChange}
      toolbar={toolbar}
    />
  );
};

export default CustomEditor;
