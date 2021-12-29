import React, { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { Thread } from "types";
import { kontenbase } from "lib/client";
import { useAppSelector } from "hooks/useAppSelector";

function ThreadPage() {
  const params = useParams();

  const thread = useAppSelector((state) => state.thread);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === params.threadId);
  }, [params.threadId]);

  return (
    <MainContentContainer
      header={
        <MainContentHeader channel="Channel" title={threadData?.name} thread />
      }
    >
      <div className="w-full px-60 pb-10">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">{threadData?.name}</h1>
          <p className="text-neutral-500 text-sm font-body">
            2 Participants{" "}
            <Link
              to={`/a/${params.workspaceId}/ch/${params.channelId}`}
              className="text-cyan-600"
            >
              #Channel
            </Link>
          </p>
        </div>
        <div className="flex items-start ">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-4">
            <img
              src="https://picsum.photos/100"
              className="h-8 w-8"
              alt="img"
            />
          </div>
          <div className="prose flex-grow-0">
            <ReactMarkdown>{threadData?.content}</ReactMarkdown>
          </div>
        </div>
        <div className="border-t-2 border-gray-200 mb-8 mt-8" />
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
