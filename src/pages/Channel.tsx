import Badge from "components/Badge/Badge";
import IconButton from "components/Button/IconButton";
import InboxMessage from "components/InboxMessage/InboxMessage";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import React from "react";

function ChannelPage() {
  return (
    <MainContentContainer>
      <header className="mb-2">
        <div className="mb-7">
          <h1 className="font-bold text-3xl">General</h1>
          <p className="text-neutral-500 font-body">Public</p>
        </div>
      </header>
    </MainContentContainer>
  );
}

export default ChannelPage;
