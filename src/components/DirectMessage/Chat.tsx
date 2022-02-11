import { useRemirror } from "@remirror/react";
import Remirror from "components/Remirror";
import { extensions } from "components/Remirror/extensions";
import React from "react";
import { htmlToProsemirrorNode } from "remirror";
import { Message } from "types";
import { parseContent } from "utils/helper";

type Props = {
  isOwn?: boolean;
  data?: Message;
};

const Chat = ({ isOwn, data }: Props) => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => extensions(false),
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(data.content),
    selection: "end",
  });

  return (
    <li
      className={`${
        isOwn ? "bg-indigo-50 self-end" : "bg-indigo-500 text-white self-start"
      } py-2 px-3  rounded-lg mb-2 max-w-[280px] md:max-w-lg`}
    >
      <Remirror
        remmirorProps={{ manager, onChange, state }}
        fromMessage
        readOnly
      />
    </li>
  );
};

export default Chat;
