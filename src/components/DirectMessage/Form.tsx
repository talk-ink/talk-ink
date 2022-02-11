import { useRemirror } from "@remirror/react";
import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import Remirror from "components/Remirror";
import { extensions } from "components/Remirror/extensions";
import { addMessage, deleteMessage } from "features/messages";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import React, { useRef } from "react";
import { BiTrash } from "react-icons/bi";
import { MdSend } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import { htmlToProsemirrorNode } from "remirror";
import { randomString } from "utils/helper";

type Props = {
  isShowEditor?: boolean;
  setIsShowEditor?: React.Dispatch<React.SetStateAction<boolean>>;
};

interface EditorRef {
  setContent: (content: any) => void;
}

const MessageForm = ({ isShowEditor, setIsShowEditor }: Props) => {
  const params = useParams();
  const [showToast] = useToast();

  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const editorRef = useRef<EditorRef | null>(null);

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const {
    manager,
    onChange,
    state,
    setState: setRemirrorState,
  } = useRemirror({
    extensions: () => extensions(false, "Write a message..."),
    stringHandler: htmlToProsemirrorNode,
    content: "",
    selection: "end",
  });

  const discardComment = () => {
    setRemirrorState(
      manager.createState({
        stringHandler: htmlToProsemirrorNode,
        content: "",
      })
    );

    setIsShowEditor(false);
  };

  const handleShowEditor = async () => {
    setIsShowEditor(true);
  };

  const handleCreateMessage = async () => {
    const _tempId = randomString();
    try {
      dispatch(
        addMessage({
          toUserId: params.userId,
          message: {
            content: JSON.stringify(state),
            workspace: [params.workspaceId],
          },
          loggedUserId: auth.user._id,
          _tempId,
        })
      );

      discardComment();

      const { error } = await kontenbase
        .service("Messages")
        .create({
          content: JSON.stringify(state),
          toUser: params.userId,
          workspace: params.workspaceId,
        });
      if (error) throw new Error(error.message);
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
      dispatch(deleteMessage({ messageId: _tempId, toUserId: params.userId }));
    }
  };

  return (
    <div>
      {!isShowEditor && (
        <button
          className="w-full p-3 px-5 flex items-start rounded-full outline-indigo-100 bg-slate-100 hover:bg-slate-200"
          onClick={handleShowEditor}
        >
          <p className="text-sm text-slate-700">Write a message...</p>
        </button>
      )}

      {isShowEditor && (
        <div
          className={`px-2 border-solid border-[1px] border-light-blue-500 rounded-xl pt-2`}
        >
          <Remirror
            remmirorProps={{ manager, onChange, state }}
            fromComment
            editorRef={editorRef}
          />

          <div className="flex justify-between -mt-9">
            <div />
            <div className="flex items-center py-2">
              {!isMobile && (
                <Button
                  type="submit"
                  className="mr-3 text-sm flex items-center justify-center bg-indigo-100 min-w-[5rem] text-black"
                  onClick={discardComment}
                >
                  Discard
                </Button>
              )}
              {!isMobile && (
                <Button
                  type="submit"
                  className="text-sm flex items-center justify-center bg-indigo-500 min-w-[5rem] text-white"
                  onClick={handleCreateMessage}
                >
                  Post
                </Button>
              )}
              {isMobile && (
                <IconButton
                  size="medium"
                  //   onClick={handleCreateComment}
                  //   className="z-50"
                >
                  <BiTrash size={20} className="text-slate-500 " />
                </IconButton>
              )}
              {isMobile && (
                <IconButton
                  size="medium"
                  //   onClick={handleCreateComment}
                  //   className="z-50"
                >
                  <MdSend size={20} className="text-indigo-500 " />
                </IconButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageForm;
