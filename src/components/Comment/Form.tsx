import React, { useState } from "react";

import { convertToRaw, EditorState } from "draft-js";

import Avatar from "components/Avatar/Avatar";
import Button from "components/Button/Button";
import CommentEditor from "components/Editor/Editor";

import { createComment } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";

interface IProps {
  isShowEditor: boolean;
  setIsShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
  threadId: string;
  scrollToBottom: () => void;
}

const Form: React.FC<IProps> = ({
  isShowEditor,
  setIsShowEditor,
  threadId,
  scrollToBottom,
}) => {
  const dispatch = useAppDispatch();
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  const discardComment = () => {
    setIsShowEditor(false);
    setEditorState(EditorState.createEmpty());
  };

  const handleCreateComment = () => {
    dispatch(
      createComment({
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        threadId,
      })
    );
    discardComment();
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  return (
    <div className="fixed bottom-0 px-5 md:px-0 left-0 md:left-auto md:right-auto w-full md:w-6/12 bg-white z-30">
      {!isShowEditor && (
        <div className="flex items-center py-5 ">
          <div>
            <Avatar src="https://picsum.photos/100" />
          </div>
          <input
            className="ml-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hover:cursor-pointer"
            type="text"
            placeholder="Input Your Message"
            readOnly
            onClick={() => {
              setIsShowEditor(true);
            }}
          />
        </div>
      )}

      {isShowEditor && (
        <div className="px-2 border-solid border-2 border-light-blue-500 rounded-md mb-5	">
          <CommentEditor
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <div className="flex justify-between">
            icon
            <div className="flex items-center py-2">
              <Button
                type="submit"
                className="mr-3 text-sm flex items-center justify-center bg-cyan-100 min-w-[5rem] text-black"
                onClick={discardComment}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="text-sm flex items-center justify-center bg-cyan-500 min-w-[5rem] text-white"
                onClick={handleCreateComment}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
