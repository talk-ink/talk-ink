import React from "react";

import InboxEmpty from "assets/image/inbox_empty.svg";

function ChannelEmpty() {
  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <img className="w-96" src={InboxEmpty} alt="inbox empty" />

      <p className="text-neutral-500 w-96 text-center">
        Time to create or take a break
      </p>
    </div>
  );
}

export default ChannelEmpty;
