import Badge from "components/Badge/Badge";
import IconButton from "components/Button/IconButton";
import InboxMessage from "components/InboxMessage/InboxMessage";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import React from "react";

function InboxPage() {
  return (
    <MainContentContainer>
      <header className="mb-2">
        <div className="mb-7">
          <h1 className="font-bold text-3xl">Inbox</h1>
          <p className="text-neutral-500 font-body">
            Good morning! 1 thread to Inbox Zero
          </p>
        </div>
        <div className="flex justify-between">
          <nav className="flex gap-2 items-center">
            <Badge active title="Active" />
            <Badge title="Done" />
          </nav>
          <IconButton />
        </div>
      </header>
      <ul>
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
        <InboxMessage />
      </ul>
    </MainContentContainer>
  );
}

export default InboxPage;
