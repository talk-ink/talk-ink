import React, { useEffect, useState } from "react";

import { BiDotsHorizontalRounded } from "react-icons/bi";

import Badge from "components/Badge/Badge";
import IconButton from "components/Button/IconButton";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";

function InboxPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
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
          <IconButton>
            <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
          </IconButton>
        </div>
      </header>
      <ul>
        {loading ? (
          <ContentSkeleton />
        ) : (
          <>
            <ContentItem />
            <ContentItem />
            <ContentItem />
            <ContentItem />
            <ContentItem />
            <ContentItem />
            <ContentItem />
            <ContentItem />
          </>
        )}
      </ul>
    </MainContentContainer>
  );
}

export default InboxPage;
