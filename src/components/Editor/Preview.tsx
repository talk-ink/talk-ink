import React from "react";

import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface IProps {
  content: string;
}

const Preview: React.FC<IProps> = ({ content }) => {
  return (
    <Editor
      readOnly={true}
      editorState={EditorState.createWithContent(
        convertFromRaw(JSON.parse(content))
      )}
      toolbarHidden
    />
  );
};

export default Preview;
