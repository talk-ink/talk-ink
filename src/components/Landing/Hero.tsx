import React from "react";
import { Link } from "react-router-dom";

import Button from "components/Button/Button";

import AtIcon from "assets/image/at.png";
import ChatBubble from "assets/image/chat-bubble.png";

function LandingHero() {
  return (
    <section className="w-full pt-10 flex flex-col items-center justify-center relative">
      <div className="mb-8 relative z-10">
        <h1 className="text-6xl mb-2">
          Simple as <span className="font-bold text-cyan-500">Email</span>
        </h1>
        <h1 className="text-6xl mb-2 ml-28">
          Realtime as <span className="font-bold text-cyan-500">Chat</span>
        </h1>
        <h1 className="text-6xl -ml-10">
          Readable as <span className="font-bold text-cyan-500">Thread</span>
        </h1>
      </div>
      <div className="w-8/12 text-center">
        <p className="text-xl text-neutral-500">
          Talk.Ink is async messaging for teams burned out by real-time,
          all-the-time communication and ready for a new way of working
          together.
        </p>
      </div>
      <div className="mt-14">
        <Link to="/register">
          <Button className="text-lg p-5 text-white bg-cyan-500">
            Try this out!
          </Button>
        </Link>
      </div>
      <img src={ChatBubble} className="h-60 w-60 absolute right-10 top-5 z-0" />

      <img src={AtIcon} className="h-64 w-64 absolute left-10 top-72 z-0" />
    </section>
  );
}

export default LandingHero;
