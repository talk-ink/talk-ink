import { Menu } from "@headlessui/react";
import { useRemirror } from "@remirror/react";
import IconButton from "components/Button/IconButton";
import MenuItem from "components/Menu/MenuItem2";
import Remirror from "components/Remirror";
import { extensions } from "components/Remirror/extensions";
import { deleteMessage } from "features/messages";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import { SelectedMessage } from "pages/Message";
import React, { useEffect } from "react";
import { BiDotsVerticalRounded, BiEditAlt, BiTrash } from "react-icons/bi";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import { htmlToProsemirrorNode } from "remirror";
import { Message } from "types";
import { parseContent } from "utils/helper";

type Props = {
  isOwn?: boolean;
  data?: Message;
  selectedMessage?: SelectedMessage;
  setSelectedMessage?: React.Dispatch<React.SetStateAction<SelectedMessage>>;
};

const Chat = ({ isOwn, data, selectedMessage, setSelectedMessage }: Props) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const params = useParams();
  const [showToast] = useToast();

  const {
    manager,
    state,
    onChange,
    setState: setMessageState,
  } = useRemirror({
    extensions: () => extensions(false),
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(data.content),
    selection: "end",
  });

  const dispatch = useAppDispatch();

  const handleDeleteMessage = async () => {
    try {
      dispatch(
        deleteMessage({
          messageId: data?._id ? data._id : data._tempId,
          toUserId: params.userId,
        })
      );

      if (!data?._id) return;

      const { error } = await kontenbase
        .service("Messages")
        .deleteById(data?._id);

      if (error) throw new Error(error.message);
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  useEffect(() => {
    setMessageState(
      manager.createState({
        stringHandler: htmlToProsemirrorNode,
        content: parseContent(data?.content),
      })
    );
  }, [data?.content]);

  return (
    <li
      className={`${
        isOwn ? "bg-indigo-50 self-end" : "bg-indigo-500 text-white self-start"
      } py-2 px-3  rounded-lg mb-2 max-w-[280px] md:max-w-lg relative group`}
    >
      <Remirror
        remmirorProps={{ manager, onChange, state }}
        fromMessage
        readOnly
      />

      {isOwn && !isMobile && (
        <Menu
          as="div"
          className={`z-50 absolute top-1/2 transform -translate-y-1/2 ${
            isOwn ? "right-full mr-2" : "left-full ml-2"
          }`}
        >
          {({ open }) => (
            <>
              <Menu.Button as="div">
                <IconButton
                  size="medium"
                  className={`${
                    open ? "flex" : "invisible group-hover:visible"
                  }`}
                >
                  <BiDotsVerticalRounded
                    size={18}
                    className={`text-neutral-400 hover:cursor-pointer hover:text-neutral-500`}
                  />
                </IconButton>
              </Menu.Button>

              {open && (
                <Menu.Items static className="menu-container right-0">
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setSelectedMessage({ message: data, type: "edit" });
                    }}
                    title="Edit message"
                  />
                  <MenuItem
                    icon={<BiTrash size={20} className="text-neutral-400" />}
                    onClick={handleDeleteMessage}
                    title="Delete message"
                  />
                </Menu.Items>
              )}
            </>
          )}
        </Menu>
      )}
    </li>
  );
};

export default Chat;
