import React, { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { BiCheckCircle, BiCircle } from "react-icons/bi";

import InboxEmpty from "components/EmptyContent/InboxEmpty";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import IconButton from "components/Button/IconButton";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { addDoneThread, deleteDoneThread } from "features/auth";
import Modal from "components/Modal/Modal";
import { kontenbase } from "lib/client";
import { deleteInbox } from "features/inbox";

type TProps = {
  type?: "active" | "done";
};

function InboxList({ type = "active" }: TProps) {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const inbox = useAppSelector((state) => state.inbox);
  const dispatch = useAppDispatch();

  const userId: string = auth.user.id;

  const [selectedThread, setSelectedThread] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const isDoneThread = useMemo(() => {
    return type === "done";
  }, [type]);

  const inboxData = useMemo(() => {
    return inbox.inbox.filter((data) => {
      if (!auth.user.doneThreads && isDoneThread) return false;
      if (!auth.user.doneThreads && !isDoneThread) return true;
      if (isDoneThread) return auth.user.doneThreads.includes(data._id);
      return !auth.user.doneThreads.includes(data._id);
    });
  }, [inbox.inbox, auth.user, params]);

  const markHandler = async (inboxId: string) => {
    try {
      if (isDoneThread) {
        dispatch(deleteDoneThread(inboxId));
      } else {
        dispatch(addDoneThread(inboxId));
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  const threadDeleteHandler = async () => {
    setApiLoading(true);
    try {
      const deletedThread = await kontenbase
        .service("Threads")
        .deleteById(selectedThread?._id);

      if (deletedThread?.data) {
        setSelectedThread(null);
      }
      dispatch(deleteInbox(deletedThread.data));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setApiLoading(false);
    }
  };

  const loading = inbox.loading;
  return (
    <div>
      {loading ? (
        <ContentSkeleton />
      ) : (
        <>
          {inboxData?.length > 0 ? (
            <ul>
              {inboxData.map((inbox, idx) => (
                <ContentItem
                  key={idx}
                  dataSource={inbox}
                  onClick={() => {
                    navigate(
                      `/a/${params.workspaceId}/ch/${inbox?.channel?.[0]}/t/${inbox?._id}`
                    );
                  }}
                  otherButton={
                    <IconButton
                      onClick={() => {
                        markHandler(inbox._id);
                      }}
                    >
                      {isDoneThread && (
                        <BiCircle size={24} className="text-neutral-400" />
                      )}
                      {!isDoneThread && (
                        <BiCheckCircle size={24} className="text-neutral-400" />
                      )}
                    </IconButton>
                  }
                  setSelectedThread={setSelectedThread}
                />
              ))}
            </ul>
          ) : (
            <>
              <InboxEmpty />
            </>
          )}
        </>
      )}

      <Modal
        header="Delete Thread"
        visible={!!selectedThread}
        onClose={() => {
          setSelectedThread(null);
        }}
        onCancel={() => {
          setSelectedThread(null);
        }}
        onConfirm={() => {
          threadDeleteHandler();
        }}
        okButtonText="Confirm"
      >
        Are you sure you want to delete this thread?
      </Modal>
    </div>
  );
}

export default InboxList;
