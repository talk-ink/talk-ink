import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import { Thread } from "types";
import { kontenbase } from "lib/client";

function ThreadPage() {
  const params = useParams();
  const [threadData, setThreadData] = useState<Thread | undefined>();

  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const getThreadData = async () => {
    setApiLoading(true);
    try {
      const { data } = await kontenbase
        .service("Threads")
        .findById(params.threadId);
      if (!data) throw new Error("Invalid thread");

      setThreadData(data);
    } catch (error) {
      console.log("err", error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getThreadData();
  }, [params?.threadId]);
  return (
    <MainContentContainer
      header={
        <MainContentHeader channel="Channel" title={threadData?.name} thread />
      }
    >
      <div className="w-full px-20 pb-10">
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
        <div className="flex items-start">
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
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
