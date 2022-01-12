import React, { useRef, useEffect } from "react";

import { EditorState } from "draft-js";
import { toolbar } from "utils/editor-toolbar";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { kontenbase } from "lib/client";

interface IProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

const CustomEditor: React.FC<IProps> = ({ editorState, setEditorState }) => {
  const editorRef = useRef(null);

  const onEditorStateChange = (editorState: EditorState) => {
    setEditorState(editorState);
  };

  useEffect(() => {
    editorRef.current.focus();
  }, []);

  const uploadCallback = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onloadend = async () => {
        const form_data = new FormData();
        form_data.append("file", file);
        try {
          const { data } = await kontenbase.storage.upload(file);
          resolve({ data: { link: data.url } });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Editor
      editorRef={(ref) => (editorRef.current = ref)}
      editorState={editorState}
      toolbarClassName="toolbarClassName"
      wrapperClassName="editor-wrapper"
      editorClassName="editor"
      onEditorStateChange={onEditorStateChange}
      toolbar={{
        ...toolbar,
        image: {
          icon: undefined,
          className: undefined,
          component: undefined,
          popupClassName: undefined,
          urlEnabled: true,
          uploadEnabled: true,
          alignmentEnabled: true,
          uploadCallback: uploadCallback,
          previewImage: true,
          inputAccept: "image/gif,image/jpeg,image/jpg,image/png,image/svg",
          alt: { present: false, mandatory: false },
          defaultSize: {
            height: "auto",
            width: "auto",
          },
        },
      }}
      stripPastedStyles={true}
    />
  );
};

export default CustomEditor;
