import React, { useEffect, useMemo, useState } from "react";

import {
  BiCheck,
  BiCheckCircle,
  BiDotsHorizontalRounded,
} from "react-icons/bi";
import { Outlet, useLocation, useParams } from "react-router-dom";

import Badge from "components/Badge/Badge";
import IconButton from "components/Button/IconButton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import Modal from "components/Modal/Modal";

import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { kontenbase } from "lib/client";
import { updateUser } from "features/auth";
import { fetchThreads } from "features/threads/slice/asyncThunk";
import { addThread, deleteThread, updateThread } from "features/threads";
import { inboxFilter } from "utils/helper";

function InboxPage() {
  const [showToast] = useToast();

  const { pathname } = useLocation();
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [inboxModal, setInboxModal] = useState<
    "done" | "read" | null | undefined
  >(null);

  const userId: string = auth.user._id;

  const isDoneThread = useMemo(() => {
    return pathname.includes("inbox/done");
  }, [pathname]);

  const channelData: string[] = useMemo(
    () => channel.channels.map((data) => data._id),
    [channel.channels]
  );

  const threadData = useMemo(() => {
    return thread.threads
      .filter((data) =>
        inboxFilter({
          thread: data,
          channelIds: channelData,
          userData: auth.user,
          isDoneThread,
        })
      )
      .filter((item) => item.tagedUsers?.includes(auth.user._id));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.threads, auth.user, params, channelData]);

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
          await kontenbase.service("Users").link(auth.user._id, {
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
          await kontenbase.service("Users").link(auth.user._id, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  // function timeout(delay: number) {
  //   return new Promise((res) => setTimeout(res, delay));
  // }

  useEffect(() => {
    let key: string | undefined;

    kontenbase.realtime
      .subscribe("Threads", { event: "*" }, async (message) => {
        const { event, payload } = message;
        const isUpdate = event === "UPDATE_RECORD";

        const isCurrentWorkspace = isUpdate
          ? payload?.before?.workspace?.includes(params.workspaceId)
          : payload?.workspace?.includes(params.workspaceId);

        const isNotCreatedByThisUser = isUpdate
          ? payload?.before?.createdBy !== auth.user._id
          : payload?.createdBy !== auth.user._id;

        const isThreadInJoinedChannel = channelData.includes(
          isUpdate ? payload?.before?.channel?.[0] : payload?.channel?.[0]
        );

        const { data } = await kontenbase.service("Users").find({
          where: {
            id: isUpdate ? payload?.before?.createdBy : payload.createdBy,
          },
        });

        const createdBy = data?.[0];

        if (
          isCurrentWorkspace &&
          isThreadInJoinedChannel &&
          isNotCreatedByThisUser
        ) {
          switch (event) {
            case "UPDATE_RECORD":
              if (payload.before.tagedUsers.includes(auth.user._id)) {
                if (
                  threadData.find((item) => item._id === payload.before?._id)
                ) {
                  const { data } = await kontenbase.service("Comments").find({
                    where: {
                      threads: payload.before._id,
                    },
                  });

                  dispatch(
                    updateThread({
                      ...payload.before,
                      ...payload.after,
                      createdBy,
                      comments: data,
                    })
                  );
                } else {
                  dispatch(
                    addThread({
                      ...payload.before,
                      ...payload.after,
                      createdBy,
                    })
                  );
                }

                const { user: userData } = await kontenbase.auth.user();

                dispatch(updateUser({ ...userData, avatar: auth.user.avatar }));
              }
              break;
            case "CREATE_RECORD":
              dispatch(addThread({ ...payload, createdBy }));
              break;
            case "DELETE_RECORD":
              dispatch(deleteThread(payload));
              break;

            default:
              break;
          }
        }
      })
      .then((result) => (key = result));

    return () => {
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelData, threadData]);

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
                      onClick={() => {
                        setInboxModal("done");
                      }}
                      title="Mark all done"
                      disabled={isDoneThread}
                    />
                    <MenuItem
                      icon={<BiCheck size={20} className="text-neutral-400" />}
                      onClick={() => {
                        setInboxModal("read");
                      }}
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
      <Modal
        visible={!!inboxModal}
        header={`Are you sure you want to mark all Inbox threads as ${inboxModal}?`}
        onCancel={() => {
          setInboxModal(null);
        }}
        onClose={() => {
          setInboxModal(null);
        }}
        okButtonText={`Mark all ${inboxModal}`}
        onConfirm={() => {
          if (inboxModal === "done") {
            doneAllHandler();
          }
          if (inboxModal === "read") {
            readAllHandler();
          }
          setInboxModal(null);
        }}
      >
        <p className="text-sm">This action cannot be undone</p>
      </Modal>
      <Outlet />
    </MainContentContainer>
  );
}

export default InboxPage;
