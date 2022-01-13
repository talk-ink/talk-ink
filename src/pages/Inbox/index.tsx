import React, { useEffect, useMemo, useState } from "react";

import {
  BiCheck,
  BiCheckCircle,
  BiDotsHorizontalRounded,
} from "react-icons/bi";

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
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import { useToast } from "hooks/useToast";
import { updateUser } from "features/auth";
import { kontenbase } from "lib/client";

function InboxPage() {
  const [showToast] = useToast();

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

  const readAllHandler = async () => {
    try {
      let userReaded: string[] = [];
      if (auth.user?.readedThreads) {
        userReaded = auth.user.readedThreads;
      }
      const threadIds = threadData.map((thread) => thread._id);
      const uniqueId = new Set([...threadIds, ...userReaded]);

      [...uniqueId].forEach((id, idx) => {
        setTimeout(async () => {
          await kontenbase.service("Users").link(auth.user.id, {
            readedThreads: id,
          });
        }, idx * 100);
      });

      dispatch(updateUser({ readedThreads: [...uniqueId] }));
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error.message)}` });
    }
  };
  const doneAllHandler = async () => {
    try {
      let userDoneThreads: string[] = [];
      if (auth.user?.doneThreads) {
        userDoneThreads = auth.user.readedThreads;
      }
      const threadIds = threadData.map((thread) => thread._id);
      const uniqueId = new Set([...threadIds, ...userDoneThreads]);

      [...uniqueId].forEach((id, idx) => {
        setTimeout(async () => {
          await kontenbase.service("Users").link(auth.user.id, {
            doneThreads: id,
          });
        }, idx * 100);
      });
      dispatch(updateUser({ doneThreads: [...uniqueId] }));
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error.message)}` });
    }
  };

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
          {threadData.length > 0 && (
            <Popup
              content={
                <div>
                  <Menu>
                    <MenuItem
                      icon={
                        <BiCheckCircle size={20} className="text-neutral-400" />
                      }
                      onClick={doneAllHandler}
                      title="Mark all done"
                      disabled={isDoneThread}
                    />
                    <MenuItem
                      icon={<BiCheck size={20} className="text-neutral-400" />}
                      onClick={readAllHandler}
                      title="Mark all read"
                      disabled={isDoneThread}
                    />
                  </Menu>
                </div>
              }
              position="left"
            >
              <IconButton>
                <BiDotsHorizontalRounded
                  size={24}
                  className="text-neutral-400"
                />
              </IconButton>
            </Popup>
          )}
        </div>
      </header>
      <Outlet />
    </MainContentContainer>
  );
}

export default InboxPage;
