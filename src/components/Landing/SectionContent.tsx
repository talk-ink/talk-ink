import React from "react";

import HeroTemplate from "assets/image/landing/hero-temp.svg";
import HeroEmail from "assets/image/landing/email.svg";
import HeroThread from "assets/image/landing/thread.svg";
import HeroChat from "assets/image/landing/chat.svg";

type Props = React.PropsWithChildren<{
  header?: string;
  subHeader?: string;
  reverse?: boolean;
  type: "email" | "thread" | "chat";
}>;

function SectionContent({ header, subHeader, reverse, type }: Props) {
  const image = {
    email: HeroEmail,
    thread: HeroThread,
    chat: HeroChat,
  };

  return (
    <div className="grid grid-cols-2 gap-5 md:gap-20 items-start mb-20">
      <div className={`${reverse && "order-2"}`}>
        <img src={image[type]} className="w-full" />
      </div>
      <div className={`${reverse && "order-1"}`}>
        <h2 className="font-montserrat font-extrabold text-2xl md:text-4xl mb-2">
          {header}
        </h2>
        <p className="font-montserrat font-medium text-md md:text-2xl 2xl:text-3xl">
          {subHeader}
        </p>
      </div>
    </div>
  );
}

export default SectionContent;
