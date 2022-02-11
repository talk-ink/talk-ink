import React from "react";

type Props = {
  isOwn?: boolean;
};

const Chat = ({ isOwn }: Props) => {
  return (
    <li
      className={`${
        isOwn ? "self-end" : "self-start"
      } py-2 px-3 bg-indigo-50 rounded-lg mb-2 max-w-lg `}
    >
      <p className="">
        mantap gan hehehee aiwejiawej awieja weiawej awie awoekaowek
        aowekaowekaow eawoekaweo awkeo o
      </p>
    </li>
  );
};

export default Chat;
