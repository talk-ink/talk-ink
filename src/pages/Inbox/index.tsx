import React, { useEffect, useMemo, useState } from "react";

import { BiDotsHorizontalRounded } from "react-icons/bi";

import Badge from "components/Badge/Badge";
import InboxEmpty from "components/EmptyContent/InboxEmpty";
import IconButton from "components/Button/IconButton";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import { Thread } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { fetchInbox } from "features/inbox";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchThreads } from "features/threads/slice/asyncThunk";

function InboxPage() {
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);
  const dispatch = useAppDispatch();

  const userId: string = auth.user.id;

  const isDoneThread = useMemo(() => {
    return pathname.includes("inbox/done");
  }, [pathname]);

  const threadData = useMemo(() => {
    return thread.threads.filter((data) => {
      if (!auth.user.doneThreads) return true;
      if (isDoneThread) return auth.user.doneThreads.includes(data._id);
      return !auth.user.doneThreads.includes(data._id);
    });
  }, [thread.threads, auth.user, params]);

  useEffect(() => {
    dispatch(
      fetchThreads({ type: "inbox", workspaceId: params.workspaceId, userId })
    );
  }, [params.workspaceId]);

  const loading = thread.loading;

  return (
    <MainContentContainer>
      <header className="mb-2">
        <div className="mb-7">
          <h1 className="font-bold text-3xl">Inbox</h1>
          {!isDoneThread && (
            <>
              {threadData.length > 0 ? (
                <p className="text-neutral-500 font-body">
                  {threadData.length} thread to Inbox Zero
                </p>
              ) : (
                <p className="text-neutral-500 font-body">
                  You’ve hit Inbox Zero!
                </p>
              )}
            </>
          )}
          {isDoneThread && (
            <p className="text-neutral-500 font-body">
              Done is better than perfect.
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <nav className="flex gap-2 items-center">
            <Badge
              active={!pathname.includes("/done")}
              title="Active"
              link={`/a/${params.workspaceId}/inbox`}
            />
            <Badge
              active={pathname.includes("/done")}
              title="Done"
              link={`/a/${params.workspaceId}/inbox/done`}
            />
          </nav>
          <IconButton>
            <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
          </IconButton>
        </div>
      </header>
      <Outlet />
    </MainContentContainer>
  );
}

export default InboxPage;
