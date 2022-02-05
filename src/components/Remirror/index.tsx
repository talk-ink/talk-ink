import React, { forwardRef, Ref, useImperativeHandle } from "react";
import "remirror/styles/all.css";
import "remirror/styles/extension-file.css";
import "./editor.css";

import { AllStyledComponent } from "@remirror/styles/emotion";
import { useMediaQuery } from "react-responsive";

import { toolbarItems } from "./toolbar";

import {
  Remirror,
  ThemeProvider,
  Toolbar,
  useRemirrorContext,
} from "@remirror/react";
import UserSuggestor from "./UserSuggestor";

interface EditorRef {
  setContent: (content: any) => void;
}

interface Mention {
  id: string;
  label: string;
}

interface IProps {
  remmirorProps?: any;
  readOnly?: boolean;
  fromComment?: boolean;
  editorRef?: any;
  listMentions?: Mention[];
}

const ImperativeHandle = forwardRef((_: unknown, ref: Ref<EditorRef>) => {
  const { setContent } = useRemirrorContext({
    autoUpdate: true,
  });

  // Expose content handling to outside
  useImperativeHandle(ref, () => ({ setContent }));

  return <></>;
});

const MyEditor: React.FC<IProps> = ({
  remmirorProps,
  readOnly,
  fromComment,
  editorRef,
  listMentions = [],
}) => {
  const { manager, onChange, state } = remmirorProps || {};
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  return (
    <div
      className={`${
        readOnly && !fromComment
          ? "readonly-editor"
          : readOnly && fromComment
          ? "readonly-comment-editor"
          : fromComment && !readOnly
          ? "comment-editor"
          : "thread-editor"
      } remirror-theme`}
    >
      <AllStyledComponent>
        <ThemeProvider>
          <Remirror
            autoFocus={!readOnly}
            manager={manager}
            autoRender="start"
            onChange={onChange}
            state={state}
            editable={!readOnly} //conba uncontroled
          >
            {!readOnly && <UserSuggestor allUsers={listMentions} />}
            {!readOnly && !isMobile && (
              <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
            )}
            {editorRef && <ImperativeHandle ref={editorRef} />}
          </Remirror>
        </ThemeProvider>
      </AllStyledComponent>
    </div>
  );
};

export default React.memo(MyEditor);

//support file upload
