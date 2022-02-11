import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
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
  useChainedCommands,
  useRemirrorContext,
} from "@remirror/react";
import UserSuggestor from "./UserSuggestor";
import { resizeFile } from "utils/helper";
import { kontenbase } from "lib/client";
import { BsImageFill } from "react-icons/bs";

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
  fromMessage?: boolean;
  editorRef?: any;
  listMentions?: Mention[];
  handleSelectTag?: (mention: Mention) => void;
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
  fromMessage,
  editorRef,
  listMentions = [],
  handleSelectTag,
  children,
}) => {
  const { manager, onChange, state } = remmirorProps || {};
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const inputRef = React.useRef(null);

  const Menu = () => {
    const [imageLoading, setImageLoading] = useState(false);
    const chain = useChainedCommands();

    return (
      <>
        <button
          onClick={() => {
            inputRef.current.click();
          }}
        >
          {imageLoading ? (
            <img
              src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
              alt="loading..."
              className="w-4 h-4"
            />
          ) : (
            <BsImageFill className="text-indigo-500" />
          )}
        </button>
        <input
          accept="image/*"
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={async (e) => {
            try {
              setImageLoading(true);
              const resized = await resizeFile(e.target.files[0], 1000);

              const { data } = await kontenbase.storage.upload(resized);

              chain.insertImage({ src: data.url }).focus().run();
            } catch (error) {
              console.log(error);
            } finally {
              setImageLoading(false);
            }
          }}
        />
      </>
    );
  };

  return (
    <div
      className={`${
        readOnly && fromMessage
          ? "readonly-message"
          : readOnly && !fromComment
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
            autoFocus={fromComment}
            manager={manager}
            autoRender="start"
            onChange={onChange}
            state={state}
            editable={!readOnly}
          >
            {!readOnly && (
              <UserSuggestor
                allUsers={listMentions}
                handleSelectTag={handleSelectTag}
              />
            )}
            {!readOnly && !isMobile && (
              <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
            )}
            {editorRef && <ImperativeHandle ref={editorRef} />}
            {!readOnly && isMobile && <Menu />}
          </Remirror>
        </ThemeProvider>
      </AllStyledComponent>
    </div>
  );
};

export default React.memo(MyEditor);

//support file upload
